import { Injectable, Logger } from '@nestjs/common';
import { YRedisService } from '../y-redis/y-redis.service';
import { DocumentService } from '../document/document.service';
import {
  Awareness,
  encodeAwarenessUpdate,
  applyAwarenessUpdate,
  removeAwarenessStates,
} from 'y-protocols/awareness';
import { writeUpdate, readSyncMessage } from 'y-protocols/sync';
import {
  Doc,
  encodeStateAsUpdate,
  applyUpdate,
  Map as YMap,
  Text as YText,
} from 'yjs';
import { createEncoder, toUint8Array } from 'lib0/encoding';
import { createDecoder } from 'lib0/decoding';
import {
  AwarenessUpdatePayload,
  FileUpdatePayload,
  SOCKET_EVENTS,
} from '@codejam/common';
import { Server, Socket } from 'socket.io';
import type { CollabSocket } from '../collaboration/collaboration.types';

export type AwarenessUpdate = {
  added: number[];
  updated: number[];
  removed: number[];
};

export type RoomDoc = {
  docId: string;
  doc: Doc;
  awareness: Awareness;
  files: Set<string>;
};

export type Language = 'javascript' | 'html' | 'css';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  // One Y.Doc per room and document
  private docs: Map<string, RoomDoc> = new Map();

  constructor(
    private readonly yRedis: YRedisService,
    private readonly documentService: DocumentService,
  ) {}

  // ==================================================================
  // Y.Doc Management Methods
  // ==================================================================

  /**
   * Create Y.Doc for a document
   * Should be called when room is initialized (before files are created)
   * Hydrates from Redis if data exists, otherwise restores from DB
   */
  async createDoc(docId: string): Promise<RoomDoc> {
    // Check if already exists
    if (this.docs.has(docId)) {
      return this.docs.get(docId)!;
    }

    // Create Y.Doc
    const doc = new Doc();
    const awareness = new Awareness(doc);

    // Initialize Y.Doc structure
    this.initializeDoc(doc);

    // Hydrate Y.Doc (Redis + DB fallback)
    // Bind to Redis for persistence
    await this.hydrateDoc(docId, doc);

    // Set up listeners
    // Do after hydration to avoid pushing existing data
    doc.on('update', this.docListener());
    awareness.on('update', this.awarenessListener(awareness));

    const roomDoc: RoomDoc = {
      docId,
      doc,
      awareness,
      files: new Set<string>(),
    };

    this.docs.set(docId, roomDoc);
    this.logger.log(`📄 Created Y.Doc for document: ${docId}`);

    return roomDoc;
  }

  /**
   * Ensure Y.Doc exists for document (creates if not exists)
   * Idempotent - safe to call multiple times
   */
  async ensureDoc(docId: string): Promise<RoomDoc> {
    const existing = this.docs.get(docId);
    if (existing) return existing;

    return this.createDoc(docId);
  }

  /**
   * Get Y.Doc for a document (throws if not found)
   * Use this for hot paths after room join
   */
  getDoc(docId: string): RoomDoc {
    const roomDoc = this.docs.get(docId);

    if (!roomDoc) {
      throw new Error(`Y.Doc not found for document: ${docId}`);
    }

    return roomDoc;
  }

  /**
   * Remove Y.Doc for a document (cleanup when room is closed)
   * TODO: Call this when room is closed or last participant leaves
   */
  async removeDoc(client: CollabSocket, server: Server): Promise<boolean> {
    const { docId } = client.data;
    const roomDoc = this.docs.get(docId);

    if (!roomDoc) return false;

    const { doc, awareness } = roomDoc;

    // Clean up YRedisService first
    await this.yRedis.closeDoc(docId);

    // Clean up listeners
    doc.off('update', this.docListener());
    awareness.off('update', this.awarenessListener(awareness));

    // Remove from map
    this.docs.delete(docId);
    this.logger.log(`🗑️ Removed Y.Doc for document: ${docId}`);

    return true;
  }

  // ==================================================================
  // File Management Methods
  // ==================================================================

  /**
   * Create a file within a document's Y.Doc
   * The Y.Doc must already exist
   */
  createFile(
    docId: string,
    fileId: string,
    fileName: string,
    language?: Language,
  ) {
    const roomDoc = this.getDoc(docId);
    const { doc, files } = roomDoc;

    // files Y.Map 가져오기
    const filesMap = doc.getMap('files');
    const fileIdMap = doc.getMap('map');

    // 계층형 구조 생성: fileId -> { name, content }
    doc.transact(() => {
      const fileMap = new YMap<unknown>();
      const yText = new YText(); // Y.Map 안에 넣을 독립 인스턴스 생성

      // 기본 코드로 초기화
      yText.insert(0, this.initialCode(language));

      fileMap.set('name', fileName);
      fileMap.set('content', yText);
      filesMap.set(fileId, fileMap);
      fileIdMap.set(fileName, fileId);
    });

    // 파일 추적
    files.add(fileId);
    this.logger.log(
      `📝 Created file ${fileName} (${fileId}) in document ${docId}`,
    );

    // [DEBUG] Y.Map 구조 검증 로그
    const createdFileMap = filesMap.get(fileId) as YMap<unknown> | undefined;
    this.logger.debug(
      `🗂️ [Y.Map 구조] docId=${docId}, fileId=${fileId}, ` +
        `filesMap.size=${filesMap.size}, ` +
        `fileMap.has('name')=${createdFileMap?.has('name')}, ` +
        `fileMap.has('content')=${createdFileMap?.has('content')}`,
    );
  }

  /**
   * 파일 중복 확인
   */
  checkDuplicate(docId: string, fileName: string): boolean {
    const roomDoc = this.getDoc(docId);
    const { doc } = roomDoc;

    const fileIdMap = doc.getMap('map');

    if (!fileIdMap) {
      return false;
    }

    return fileIdMap.has(fileName);
  }

  /**
   * Ensure file exists in Y.Doc (creates if not exists)
   * For prototype: creates default file if none specified
   * Idempotent - safe to call multiple times
   */
  ensureFile(
    docId: string,
    fileId: string,
    fileName: string,
    language?: Language,
  ) {
    const roomDoc = this.getDoc(docId);
    const { doc } = roomDoc;

    // Y.Map에서 파일 존재 여부 체크
    const filesMap = doc.getMap('files');
    if (filesMap.has(fileId)) return; // 이미 존재하는 파일

    this.createFile(docId, fileId, fileName, language);
  }

  // ==================================================================
  // Handle Methods
  // ==================================================================

  /**
   * Prepare room document for a joining client
   * - Ensures Y.Doc exists (creates or hydrates from Redis)
   * - Creates default file if this is a new room (no existing doc in Redis)
   */
  async prepareDoc(client: CollabSocket, server: Server): Promise<void> {
    const { docId } = client.data;
    const roomDoc = this.docs.get(docId);
    if (roomDoc) return;

    // Ensure doc exists
    // Creates if not (Hydrates from Redis)
    await this.ensureDoc(docId);
  }

  /**
   * Handle document request - send initial Y.Doc state to client
   */
  handleRequestDoc(client: CollabSocket, server: Server) {
    const { docId } = client.data;
    const roomDoc = this.getDoc(docId);
    const { doc } = roomDoc;

    // Encode and send entire Y.Doc state
    const update = encodeStateAsUpdate(doc);
    const encoder = createEncoder();
    writeUpdate(encoder, update);
    const message = toUint8Array(encoder);

    client.emit(SOCKET_EVENTS.ROOM_DOC, { docId, message });
  }

  /**
   * Handle awareness request - send initial awareness states to client
   */
  handleRequestAwareness(client: CollabSocket, server: Server) {
    const { docId } = client.data;
    const { awareness } = this.getDoc(docId);

    // Send awareness states for this document
    const ids = Array.from(awareness.getStates().keys());
    const message = encodeAwarenessUpdate(awareness, ids);

    client.emit(SOCKET_EVENTS.ROOM_AWARENESS, { docId, message });
  }

  /**
   * Handle file update - process Y.js sync messages
   */
  handleFileUpdate(
    client: CollabSocket,
    server: Server,
    payload: FileUpdatePayload,
  ) {
    const { docId } = client.data;
    const { message } = payload;
    const { doc } = this.getDoc(docId);

    this.logger.debug(`📝 [UPDATE] Doc: ${docId}, Length: ${message.length}`);

    // Process Y.js sync message
    const decoder = createDecoder(message);
    const encoder = createEncoder();

    readSyncMessage(decoder, encoder, doc, client);
    const reply = toUint8Array(encoder);

    if (reply.byteLength > 0) {
      client.emit(SOCKET_EVENTS.UPDATE_FILE, { message: reply });
    }
  }

  /**
   * Handle awareness update - apply awareness changes
   */
  handleAwarenessUpdate(
    client: CollabSocket,
    server: Server,
    payload: AwarenessUpdatePayload,
  ) {
    const { docId } = client.data;
    const { message } = payload;
    const { awareness } = this.getDoc(docId);

    applyAwarenessUpdate(awareness, message, client);
  }

  /**
   * Handle remove awareness - clean up awareness states
   */
  handleRemoveAwareness(
    client: CollabSocket,
    server: Server,
    payload: { clientId: number },
  ) {
    const { docId } = client.data;
    const { clientId } = payload;
    const { awareness } = this.getDoc(docId);

    removeAwarenessStates(awareness, [clientId], client);
  }

  // ==================================================================
  // Private Helper Methods
  // ==================================================================

  /**
   * 멀티파일 구조를 위한 Y.Map 초기화
   */

  private initializeDoc(doc: Doc) {
    doc.getMap('files'); // Y.Map<fileId, Y.Map<name, content>>
    doc.getMap('map'); // 파일 이름 -> 파일 ID 추적용
    doc.getMap('meta'); // 추후 스냅샷 버전 관리용
  }

  /**
   * Hydrate Y.Doc
   *
   * 1. Check if doc exists in Redis (lookahead)
   * 2. Bind to Redis for persistence
   * 3. If not in Redis, restore snapshot from DB
   */
  private async hydrateDoc(docId: string, doc: Doc): Promise<void> {
    // Lookahead - Check if doc exists in Redis
    const existsInRedis = await this.yRedis.hasDocInRedis(docId);

    // Bind to Redis for persistence and hydration
    // It can be empty
    const pdoc = this.yRedis.bind(docId, doc);
    await pdoc.synced; // Wait for hydration from Redis

    // If not in Redis, restore snapshot from DB
    if (!existsInRedis) {
      const content = await this.documentService.getDocContentById(docId);
      if (content) {
        applyUpdate(doc, new Uint8Array(content));
        this.logger.log(`📄 Restored Y.Doc from DB for document: ${docId}`);
      }
    }
  }

  private initialCode(language?: Language): string {
    switch (language) {
      case 'javascript':
        return "// Write your JavaScript code here\n\nfunction hello() {\n  console.log('Hello, CodeJam!');\n}\n";
      case 'html':
        return '<!-- Write your HTML code here -->\n\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>CodeJam</title>\n  </head>\n  <body>\n    <h1>Hello, CodeJam!</h1>\n  </body>\n</html>\n';
      case 'css':
        return '/* Write your CSS code here */\n\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n';
      default:
        return "// Write your JavaScript code here\n\nfunction hello() {\n  console.log('Hello, CodeJam!');\n}\n";
    }
  }

  private docListener() {
    return (update: Uint8Array, origin: unknown) => {
      if (!origin || !(origin instanceof Socket)) return;

      const client = origin as CollabSocket;
      const { roomCode } = client.data;

      const encoder = createEncoder();
      writeUpdate(encoder, update);
      const message = toUint8Array(encoder);

      client.to(roomCode).emit(SOCKET_EVENTS.UPDATE_FILE, { message });
      client.to(roomCode).emit('update');
    };
  }

  private awarenessListener(awareness: Awareness) {
    return ({ added, updated, removed }: AwarenessUpdate, origin: unknown) => {
      if (!origin || !(origin instanceof Socket)) return;

      const client = origin as CollabSocket;
      const { roomCode } = client.data;

      const changed = added.concat(updated, removed);
      const message = encodeAwarenessUpdate(awareness, changed);

      client.to(roomCode).emit(SOCKET_EVENTS.UPDATE_AWARENESS, { message });
    };
  }
}
