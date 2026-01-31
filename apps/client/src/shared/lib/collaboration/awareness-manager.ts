import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
} from 'y-protocols/awareness';
import type { AwarenessUpdate } from '@codejam/common';

export class AwarenessManager {
  private awareness: Awareness;

  constructor(awareness: Awareness) {
    this.awareness = awareness;
  }

  /**
   * Get the Awareness instance
   */
  getAwareness(): Awareness {
    return this.awareness;
  }

  /**
   * Register a callback to be called when Awareness is updated
   * Callback receives encoded update ready to send to server
   * Only triggers for local changes to prevent echo loops
   */
  onUpdate(
    callback: (encodedUpdate: Uint8Array, origin: unknown) => void,
  ): void {
    this.awareness.on('update', (changes: AwarenessUpdate, origin: unknown) => {
      // Skip remote updates to prevent sending them back to server (echo prevention)
      if (origin === 'remote') return;

      const { added, updated, removed } = changes;

      const changed = added.concat(updated, removed);
      if (changed.length === 0) return;

      // Encode update for transmission
      const message = encodeAwarenessUpdate(this.awareness, changed);
      callback(message, origin);
    });
  }

  /**
   * Apply awareness update from network
   */
  applyUpdate(message: Uint8Array, origin: unknown): void {
    const update =
      message instanceof Uint8Array ? message : new Uint8Array(message);

    applyAwarenessUpdate(this.awareness, update, origin);
  }

  /**
   * Apply remote awareness update
   */
  applyRemoteUpdate(message: Uint8Array): void {
    this.applyUpdate(message, 'remote');
  }

  /**
   * Get local awareness state
   */
  getLocalState(): Record<string, unknown> | null {
    return this.awareness.getLocalState();
  }

  /**
   * Get local awareness state field
   */
  getLocalStateField(key: string): unknown {
    const state = this.awareness.getLocalState();
    return state?.[key];
  }

  /**
   * Set local awareness state field
   */
  setLocalStateField(key: string, value: unknown): void {
    this.awareness.setLocalStateField(key, value);
  }

  /**
   * Update current file in awareness
   */
  setCurrentFileId(fileId: string): void {
    const state = this.awareness.getLocalState();

    this.awareness.setLocalStateField('user', {
      ...state?.user,
      currentFileId: fileId,
    });
  }

  /**
   * Destroy awareness
   */
  destroy(): void {
    this.awareness.destroy();
  }
}
