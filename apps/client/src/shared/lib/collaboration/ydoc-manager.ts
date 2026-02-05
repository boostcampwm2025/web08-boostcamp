import { Doc as YDoc } from 'yjs';
import { createDecoder } from 'lib0/decoding';
import { createEncoder, toUint8Array } from 'lib0/encoding';
import { readSyncMessage, writeUpdate } from 'y-protocols/sync';

/**
 * YDocManager - Manages Y.Doc synchronization and lifecycle
 *
 * Handles Y.Doc sync protocol and document state tracking.
 * Does not manage files or awareness - those are handled separately.
 */
export class YDocManager {
  private yDoc: YDoc;
  private initialDocLoaded: boolean = false;

  private pendingUpdates: Uint8Array[] = [];
  private isBuffering: boolean = false;

  constructor(yDoc: YDoc) {
    this.yDoc = yDoc;
  }

  /**
   * Get the Y.Doc instance
   */
  getYDoc(): YDoc {
    return this.yDoc;
  }

  /**
   * Register a callback to be called when Y.Doc is updated
   * Callback receives encoded update ready to send to server
   */
  onUpdate(callback: (update: Uint8Array, origin: unknown) => void): void {
    this.yDoc.on('update', (update: Uint8Array, origin: unknown) => {
      // Encode update for transmission
      const encoder = createEncoder();
      writeUpdate(encoder, update);
      const data = toUint8Array(encoder);

      callback(data, origin);
    });
  }

  /**
   * Apply document update from network
   * Handles Y.js sync protocol
   */
  applyUpdate(message: Uint8Array, origin: unknown): Uint8Array | null {
    const update =
      message instanceof Uint8Array ? message : new Uint8Array(message);

    const decoder = createDecoder(update);
    const encoder = createEncoder();

    readSyncMessage(decoder, encoder, this.yDoc, origin);

    // Mark as initialized on first update
    if (!this.initialDocLoaded) {
      this.initialDocLoaded = true;
    }

    // Return reply if needed (sync protocol)
    const reply = toUint8Array(encoder);
    return reply.byteLength > 0 ? reply : null;
  }

  /**
   * Apply remote document update
   */
  applyRemoteUpdate(message: Uint8Array): Uint8Array | null {
    // Buffer updates during composition
    if (this.isBuffering) {
      this.pendingUpdates.push(message);
      return null;
    }

    return this.applyUpdate(message, 'remote');
  }

  /**
   * Enable or disable buffering of remote updates
   * When disabled, automatically flushes any pending updates
   */
  setBuffering(enabled: boolean): void {
    const wasBuffering = this.isBuffering;
    const isBuffering = enabled;
    if (isBuffering === wasBuffering) return;

    this.isBuffering = isBuffering;

    // Flush pending updates when buffering is disabled
    if (wasBuffering && !isBuffering && this.pendingUpdates.length > 0) {
      this.flushPendingUpdates();
    }
  }

  /**
   * Flush all pending buffered updates
   */
  private flushPendingUpdates(): void {
    // Snapshot current buffer and clear it
    const updates = [...this.pendingUpdates];
    this.pendingUpdates = [];

    // Apply all buffered updates sequentially
    for (const update of updates) {
      this.applyUpdate(update, 'remote');
    }
  }

  /**
   * Check if initial document is loaded
   */
  isInitialDocLoaded(): boolean {
    return this.initialDocLoaded;
  }

  /**
   * Destroy the Y.Doc
   */
  destroy(): void {
    this.yDoc.destroy();
  }
}
