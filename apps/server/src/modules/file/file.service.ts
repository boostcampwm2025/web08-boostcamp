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
import { v7 as uuidv7 } from 'uuid';
import {
  Language,
  getDefaultFileName,
  getDefaultFileTemplate,
} from './file.constants';

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

export type OriginServer = {
  type: 'server';
  client: CollabSocket;
  server: Server;
};

export type OriginType = 'server' | 'client' | undefined;

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  /**
   * Doc size limit
   *
   * TODO: Redis 에 있는 편집 이력을 주기적으로 압축하는 로직 필요
   * 현재 상태 - 모든 편집 작업이 개별 업데이트로 저장됨
   * 단일 문자 크기는 20~30 bytes
   * 모든 업데이트 이력을 저장하면 메모리 사용량이 빠르게 증가함
   * 최적화를 하지 않으면 클라이언트에서 1MB 를 사용하기 전에 Redis 에서 10배 이상을 사용하게 됨
   */

  private readonly MAX_DOC_SIZE = 30 * 1024 * 1024; // 30MB

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
   * Remove Y.Doc for a document
   * Y.Doc is removed when room is closed or expired
   * TODO: Call this when last participant leaves
   */
  async removeDoc(docId: string): Promise<boolean> {
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

  /**
   * Cleanup Y.Docs by docIds
   */
  async cleanupDocs(docIds: string[]): Promise<void> {
    if (docIds.length === 0) return;

    this.logger.log(`🧹 Cleaning up ${docIds.length} Y.Docs`);

    await Promise.all(docIds.map((docId) => this.removeDoc(docId)));
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
   * 파일 이름 변경
   */
  renameFile(
    docId: string,
    fileId: string,
    newName: string,
    client: CollabSocket,
    server: Server,
  ) {
    const roomDoc = this.getDoc(docId);
    const { doc } = roomDoc;

    const filesMap = doc.getMap('files');
    const fileIdMap = doc.getMap('map');

    if (!filesMap.has(fileId)) {
      return;
    }

    const fileMap = filesMap.get(fileId) as YMap<unknown>;
    const before = fileMap.get('name') as string | undefined;

    if (!before || fileIdMap.has(newName)) {
      return;
    }

    doc.transact(
      () => {
        fileMap.set('name', newName);
        fileIdMap.delete(before);
        fileIdMap.set(newName, fileId);
      },
      {
        type: 'server',
        client,
        server,
      },
    );
  }

  /**
   * 파일 삭제
   */
  deleteFile(
    docId: string,
    fileId: string,
    client: CollabSocket,
    server: Server,
  ) {
    const roomDoc = this.getDoc(docId);
    const { doc } = roomDoc;

    const filesMap = doc.getMap('files');
    const fileIdMap = doc.getMap('map');

    if (!filesMap.has(fileId)) {
      return;
    }

    const fileMap = filesMap.get(fileId) as YMap<unknown>;
    const fileName = fileMap.get('name') as string | undefined;

    if (!fileName) {
      return;
    }

    doc.transact(
      () => {
        filesMap.delete(fileId);
        fileIdMap.delete(fileName);
      },
      {
        type: 'server',
        client,
        server,
      },
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

  // ==================================================================
  // Handle Methods
  // ==================================================================

  /**
   * Prepare room document for a joining client
   * - Ensures Y.Doc exists (creates or hydrates from Redis)
   * - Creates default file if this is a new room (no existing doc in Redis)
   */
  async prepareDoc(client: CollabSocket, _server: Server): Promise<void> {
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
  handleRequestDoc(client: CollabSocket, _server: Server) {
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
  handleRequestAwareness(client: CollabSocket, _server: Server) {
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

    // Size limit guard

    const expectedSize = this.getExpectedDocSize(docId, message);

    if (expectedSize > this.MAX_DOC_SIZE) {
      const logMessage = `DOC_SIZE_EXCEEDED: ${expectedSize} > ${this.MAX_DOC_SIZE}`;

      throw new Error(logMessage);
    }

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
   * Calculate expected document size after applying update
   * @returns expected total byte length, or 0 if doc not found
   */
  private getExpectedDocSize(docId: string, message: Uint8Array): number {
    const pdoc = this.yRedis.getDoc(docId);
    if (!pdoc) return 0;

    return pdoc.totalByteLength + message.byteLength;
  }

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

  /** Generate File ID - UUID v7 */

  private generateFileId() {
    const id = uuidv7();
    return id;
  }

  /**
   * Generate initial Y.Doc snapshot with template code
   */
  generateInitialSnapshot(language?: Language): Buffer {
    const doc = new Doc();
    this.initializeDoc(doc);

    // Create initial file with template code
    const fileId = this.generateFileId();
    const name = getDefaultFileName(language);
    const template = getDefaultFileTemplate(language);

    const filesMap = doc.getMap('files');
    const fileIdMap = doc.getMap('map');

    doc.transact(() => {
      const fileMap = new YMap<unknown>();
      const yText = new YText();

      yText.insert(0, template);

      fileMap.set('name', name);
      fileMap.set('content', yText);
      filesMap.set(fileId, fileMap);
      fileIdMap.set(name, fileId);
    });

    const snapshot = encodeStateAsUpdate(doc);
    return Buffer.from(snapshot);
  }

  private initialCode(language?: Language): string {
    return getDefaultFileTemplate(language);
  }

  private docListener() {
    return (update: Uint8Array, origin: unknown) => {
      const originType = this.getOriginType(origin);
      if (!originType) return;
      const encoder = createEncoder();
      writeUpdate(encoder, update);
      const message = toUint8Array(encoder);

      if (originType === 'client') {
        const client = origin as CollabSocket;
        const { roomCode } = client.data;

        client.to(roomCode).emit(SOCKET_EVENTS.UPDATE_FILE, { message });
        client.to(roomCode).emit('update');
      } else {
        const originServer = origin as OriginServer;
        const client = originServer.client;
        const server = originServer.server;
        const { roomCode } = client.data;

        server.to(roomCode).emit(SOCKET_EVENTS.UPDATE_FILE, { message });
        server.to(roomCode).emit('update');
      }
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

  private getOriginType(origin: unknown): OriginType {
    if (!origin) {
      return undefined;
    }

    if (origin instanceof Socket) {
      return 'client';
    }

    if (typeof origin === 'object') {
      return 'server';
    }
  }
}
