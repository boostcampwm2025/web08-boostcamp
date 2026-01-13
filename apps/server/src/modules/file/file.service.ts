import { Injectable, Logger } from '@nestjs/common';
import {
  Awareness,
  encodeAwarenessUpdate,
  applyAwarenessUpdate,
  removeAwarenessStates,
} from 'y-protocols/awareness';
import { writeUpdate, readSyncMessage } from 'y-protocols/sync';
import { Doc, encodeStateAsUpdate } from 'yjs';
import { createEncoder, toUint8Array } from 'lib0/encoding';
import { createDecoder } from 'lib0/decoding';
import {
  AwarenessUpdatePayload,
  FileUpdatePayload,
  SOCKET_EVENTS,
} from '@codejam/common';
import { Server, Socket } from 'socket.io';
import type { CollabSocket } from '../collaboration/collaboration.types';

const PROTOTYPE_ID = 'prototype';

export type AwarenessUpdate = {
  added: number[];
  updated: number[];
  removed: number[];
};

export type RoomDoc = {
  roomId: number;
  doc: Doc;
  awareness: Awareness;
  files: Set<string>;
};

export type Language = 'javascript' | 'html' | 'css';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  // One Y.Doc per room
  private docs: Map<number, RoomDoc> = new Map();

  constructor() {}

  // ==================================================================
  // Y.Doc Management Methods
  // ==================================================================

  /**
   * Create Y.Doc for a room
   * Should be called when room is initialized (before files are created)
   */
  createDoc(roomId: number): RoomDoc {
    // Check if already exists
    if (this.docs.has(roomId)) {
      return this.docs.get(roomId)!;
    }

    // Create Y.Doc
    const doc = new Doc();
    const awareness = new Awareness(doc);

    // Set up listeners
    doc.on('update', this.docListener());
    awareness.on('update', this.awarenessListener(awareness));

    const roomDoc: RoomDoc = {
      roomId,
      doc,
      awareness,
      files: new Set<string>(),
    };

    this.docs.set(roomId, roomDoc);
    this.logger.log(`📄 Created Y.Doc for room: ${roomId}`);

    return roomDoc;
  }

  /**
   * Ensure Y.Doc exists for room (creates if not exists)
   * Idempotent - safe to call multiple times
   */
  ensureDoc(roomId: number): RoomDoc {
    const existing = this.docs.get(roomId);
    if (existing) return existing;

    return this.createDoc(roomId);
  }

  /**
   * Get Y.Doc for a room (throws if not found)
   */
  getDoc(roomId: number): RoomDoc {
    const roomDoc = this.docs.get(roomId);

    if (!roomDoc) {
      throw new Error(`Y.Doc not found for room: ${roomId}`);
    }

    return roomDoc;
  }

  /**
   * Remove Y.Doc for a room (cleanup when room is closed)
   * TODO: Call this when room is closed or last participant leaves
   */
  removeDoc(client: CollabSocket, server: Server): boolean {
    const { roomId } = client.data;
    const roomDoc = this.docs.get(roomId);

    if (!roomDoc) return false;

    const { doc, awareness } = roomDoc;

    // Clean up listeners
    doc.off('update', this.docListener());
    awareness.off('update', this.awarenessListener(awareness));

    // Remove from map
    this.docs.delete(roomId);
    this.logger.log(`🗑️ Removed Y.Doc for room: ${roomId}`);

    return true;
  }

  // ==================================================================
  // File Management Methods
  // ==================================================================

  /**
   * Create a file within a room's Y.Doc
   * The Y.Doc must already exist
   */
  createFile(roomId: number, fileId: string, language?: Language) {
    const roomDoc = this.getDoc(roomId);
    const { doc, files } = roomDoc;

    // Create Y.Text for this file
    const yText = doc.getText(fileId);

    // Initialize with default content
    if (yText.length === 0) {
      doc.transact(() => {
        yText.insert(0, this.initialCode(language));
      });
    }

    // Track file
    files.add(fileId);
    this.logger.log(`📝 Created file ${fileId} in room ${roomId}`);
  }

  /**
   * Ensure file exists in Y.Doc (creates if not exists)
   * For prototype: creates default file if none specified
   * Idempotent - safe to call multiple times
   */
  ensureFile(roomId: number, fileId: string, language?: Language) {
    const roomDoc = this.getDoc(roomId);
    if (roomDoc.files.has(fileId)) return; // File already exists

    this.createFile(roomId, fileId, language);
  }

  // ==================================================================
  // Handle Methods
  // ==================================================================

  /**
   * Handle create file request
   * Ensures Y.Doc exists for room and creates default file
   */
  handleCreateFile(client: CollabSocket, server: Server) {
    const { roomId } = client.data;
    const fileId = client.data.roomCode ?? PROTOTYPE_ID;
    const language = 'javascript';

    // Ensure Y.Doc exists for room
    this.ensureDoc(roomId);

    // Ensure file exists in Y.Doc
    this.ensureFile(roomId, fileId, language);
  }

  /**
   * Handle document request - send initial Y.Doc state to client
   */
  handleRequestDoc(client: CollabSocket, server: Server) {
    const { roomId } = client.data;
    const roomDoc = this.getDoc(roomId);
    const { doc } = roomDoc;

    // Encode and send entire Y.Doc state
    const update = encodeStateAsUpdate(doc);
    const encoder = createEncoder();
    writeUpdate(encoder, update);
    const message = toUint8Array(encoder);

    client.emit(SOCKET_EVENTS.ROOM_DOC, { roomId, message });
  }

  /**
   * Handle awareness request - send initial awareness states to client
   */
  handleRequestAwareness(client: CollabSocket, server: Server) {
    const { roomId } = client.data;
    const { awareness } = this.getDoc(roomId);

    // Send awareness states for this room
    const ids = Array.from(awareness.getStates().keys());
    const message = encodeAwarenessUpdate(awareness, ids);

    client.emit(SOCKET_EVENTS.ROOM_AWARENESS, { roomId, message });
  }

  /**
   * Handle file update - process Y.js sync messages
   */
  handleFileUpdate(
    client: CollabSocket,
    server: Server,
    payload: FileUpdatePayload,
  ) {
    const { roomId } = client.data;
    const { message } = payload;
    const { doc } = this.getDoc(roomId);

    this.logger.debug(`📝 [UPDATE] Room: ${roomId}, Length: ${message.length}`);

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
    const { roomId } = client.data;
    const { message } = payload;
    const { awareness } = this.getDoc(roomId);

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
    const { roomId } = client.data;
    const { clientId } = payload;
    const { awareness } = this.getDoc(roomId);

    removeAwarenessStates(awareness, [clientId], client);
  }

  // ==================================================================
  // Private Helper Methods
  // ==================================================================

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
