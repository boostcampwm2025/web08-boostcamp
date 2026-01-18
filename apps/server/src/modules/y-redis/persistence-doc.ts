import * as Y from 'yjs';
import { createMutex, mutex } from 'lib0/mutex';
import { Logger } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { YRedis } from './y-redis.types';
import { getUpdatesKey, getOffsetKey } from './y-redis.utils';
import {
  COMPACT_SCRIPT,
  PUSH_UPDATE_SCRIPT,
  FETCH_UPDATES_SCRIPT,
} from './y-redis.constants';
import type {
  IPersistenceDoc,
  CompactionResult,
  UpdateHandler,
  PersistenceDocInitializeOptions as InitializeOptions,
  GetSnapshotCallback,
} from './y-redis.types';

/**
 * PersistenceDoc - Redis-backed Y.Doc persistence layer
 *
 * Manages Y.Doc updates in Redis with support for compaction.
 *
 * Key concepts:
 * - Updates: A list of Y.Doc updates stored in Redis. Each update is a binary.
 * - Offset: Total number of compacted/removed updates (stored in Redis)
 * - Logical Clock (_clock): Total number of updates seen by this instance
 * - Physical Index: Position in Redis list = clock - offset
 *
 * Callback design:
 * - **getSnapshot**: Provided at construction, called during clock inconsistency recovery
 *   Returns { snapshot, clock, totalByteLength? } from persistent storage (e.g., database)
 * - **onCompactComplete**: Provided to compact(), called after compaction completes
 *   Receives CompactionResult to save to persistent storage
 *
 * Initialization:
 * 1. **Recommended**: Call initialize(options) after binding with clock from DB
 *    - Avoids inconsistency handling if clock matches offset
 * 2. **Auto-Recovery**: Don't call initialize() or pass clock=0
 *    - If offset > 0, triggers getSnapshot callback to reload
 *
 * Consistency guarantee:
 * - When `clock < offset`, triggers snapshot reload via `getSnapshot` callback
 * - This can happen during initial hydration or if database snapshot is stale
 * - getUpdates() implements exponential backoff retry with snapshot reload
 */
export class PersistenceDoc implements IPersistenceDoc {
  private readonly logger = new Logger(PersistenceDoc.name);

  private readonly mtx: mutex;

  private _clock = 0;
  private _fetchingClock = 0;
  private _totalByteLength = 0;
  private readonly updateHandler: UpdateHandler;
  private readonly getSnapshot: GetSnapshotCallback;

  public readonly synced: Promise<PersistenceDoc>;

  constructor(
    private readonly redis: YRedis,
    private readonly sub: Redis,
    private readonly docs: Map<string, PersistenceDoc>,
    public readonly name: string,
    public readonly doc: Y.Doc,

    getSnapshot: GetSnapshotCallback,
  ) {
    this.mtx = createMutex();
    this.getSnapshot = getSnapshot;

    this.updateHandler = (update: Uint8Array) => {
      // mtx: only store update in redis if this document update does not originate from redis
      this.mtx(() => {
        this._totalByteLength += update.byteLength;

        this.pushUpdate(Buffer.from(update))
          .then(({ len, offset }) => {
            const logicalClock = len + offset;

            if (logicalClock === this._clock + 1) {
              this._clock++;
              if (this._fetchingClock < this._clock) {
                this._fetchingClock = this._clock;
              }
            }

            this.redis
              .publish(this.name, logicalClock.toString())
              .catch((err) => {
                const message = `Failed to publish update to Redis: ${err.message}`;
                this.logger.error(message);
              });
          })
          .catch((err) => {
            const message = `Failed to push update to Redis: ${err.message}`;
            this.logger.error(message);
          });
      });
    };

    if (doc.store.clients.size > 0) {
      this.updateHandler(Y.encodeStateAsUpdate(doc));
    }

    doc.on('update', this.updateHandler);
    this.synced = this.sub.subscribe(this.name).then(() => this.getUpdates());
  }

  get clock(): number {
    return this._clock;
  }

  get fetchingClock(): number {
    return this._fetchingClock;
  }

  set fetchingClock(value: number) {
    this._fetchingClock = value;
  }

  get totalByteLength(): number {
    return this._totalByteLength;
  }

  /**
   * Initialize PersistenceDoc state from external source (e.g., DB snapshot)
   * Call this before syncing to avoid triggering inconsistency handling
   * If not called, clock defaults to 0 and inconsistency logic may fire
   */
  initialize(options: InitializeOptions): void {
    this._clock = options.clock;
    this._fetchingClock = options.clock;
    this._totalByteLength = options.totalByteLength;
  }

  async destroy(): Promise<void> {
    this.doc.off('update', this.updateHandler);
    this.docs.delete(this.name);
    await this.sub.unsubscribe(this.name);
  }

  async getUpdates(retries?: number): Promise<PersistenceDoc> {
    const currentRetries = retries ?? 0;
    const startClock = this._clock;

    // Fetch offset and updates atomically
    const { updates, offset } = await this.fetchUpdates(startClock);

    // Resilience check: detect clock behind offset
    if (startClock < offset) {
      return this.handleClockInconsistency(startClock, offset, currentRetries);
    }

    const message = `Fetched ${updates.length} updates for ${this.name} (offset: ${offset})`;
    this.logger.debug(message);

    this.mtx(() => {
      this.doc.transact(() => {
        updates.forEach((update) => {
          this._totalByteLength += update.byteLength;
          Y.applyUpdate(this.doc, update);
        });

        const nextClock = startClock + updates.length;
        if (this._clock < nextClock) {
          this._clock = nextClock;
        }
        if (this._fetchingClock < this._clock) {
          this._fetchingClock = this._clock;
        }
      });
    });

    if (this._fetchingClock <= this._clock) {
      return this;
    }

    // there is still something missing. new updates came in. fetch again.
    if (updates.length === 0) {
      // Calling getUpdates recursively has the potential to be an infinite fetch-call.
      // In case no new updates came in, reset _fetching clock
      // (in case the pubsub lied / send an invalid message).
      // Being overly protective here
      this._fetchingClock = this._clock;
    }

    // Recursive call to catch up if new updates arrived during the current fetch
    return this.getUpdates(0);
  }

  /**
   * Handle clock inconsistency when local clock is behind Redis offset
   * This can happen when Redis compaction completes but DB snapshot update is still in progress
   */
  private async handleClockInconsistency(
    clock: number,
    offset: number,
    currentRetries: number,
  ): Promise<PersistenceDoc> {
    const MAX_RETRIES = 5;
    const BASE_DELAY_MS = 50;

    if (currentRetries >= MAX_RETRIES) {
      const errorMsg =
        `Clock inconsistency persisted after ${MAX_RETRIES} retries. ` +
        `clock=${clock}, offset=${offset}. ` +
        `This indicates DB snapshot is behind Redis compaction. ` +
        `Please check DB snapshot and Redis offset synchronization.`;
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    const delay = BASE_DELAY_MS * Math.pow(2, currentRetries);
    const warnMsg =
      `Clock inconsistency detected: clock=${clock} < offset=${offset}. ` +
      `Reloading from DB after ${delay}ms (retry ${currentRetries + 1}/${MAX_RETRIES})...`;
    this.logger.warn(warnMsg);

    // Wait with exponential backoff

    await new Promise((resolve) => setTimeout(resolve, delay));

    // Reload snapshot from external source (e.g., database)

    const { snapshot, clock: snapshotClock } = await this.getSnapshot();

    const reloadMessage = `Reloaded snapshot: clock=${snapshotClock}, 
      snapshot size=${snapshot.byteLength} bytes`;
    this.logger.log(reloadMessage);

    // Apply snapshot and update clock

    this.mtx(() => {
      this.doc.transact(() => {
        Y.applyUpdate(this.doc, snapshot);

        this._clock = snapshotClock;
        this._fetchingClock = snapshotClock;
        this._totalByteLength = snapshot.byteLength;
      });
    });

    // Retry getUpdates

    return this.getUpdates(currentRetries + 1);
  }

  async compact(
    onCompactComplete?: (result: CompactionResult) => Promise<void>,
  ): Promise<CompactionResult> {
    const { updates, newOffset } = await this.consumeUpdates();

    const message = `Compacting ${updates.length} updates for ${this.name}`;
    this.logger.debug(message);

    // Create snapshot by merging all updates

    const tempDoc = new Y.Doc();
    tempDoc.transact(() => {
      updates.forEach((update) => {
        Y.applyUpdate(tempDoc, update);
      });
    });

    const snapshot = Y.encodeStateAsUpdate(tempDoc);

    const compactMessage = `Compacted ${this.name}:
      removed ${updates.length} updates, new offset: ${newOffset}`;
    this.logger.log(compactMessage);

    const result: CompactionResult = { snapshot, clock: newOffset };

    // Call callback if provided
    if (onCompactComplete) {
      await onCompactComplete(result);
    }

    return result;
  }

  private async pushUpdate(
    update: Buffer,
  ): Promise<{ len: number; offset: number }> {
    const updatesKey = getUpdatesKey(this.name);
    const offsetKey = getOffsetKey(this.name);

    // RPUSH + GET offset

    const [len, offset] = (await this.redis.eval(
      PUSH_UPDATE_SCRIPT,
      2,
      updatesKey,
      offsetKey,
      update,
    )) as [number, number];

    return { len, offset };
  }

  private async fetchUpdates(
    clock: number,
  ): Promise<{ updates: Buffer[]; offset: number }> {
    const updatesKey = getUpdatesKey(this.name);
    const offsetKey = getOffsetKey(this.name);

    // LRANGE updates + GET offset

    const [updates, offset] = (await this.redis.eval(
      FETCH_UPDATES_SCRIPT,
      2,
      updatesKey,
      offsetKey,
      clock,
    )) as [Buffer[], number];

    return { updates, offset };
  }

  private async consumeUpdates(): Promise<{
    updates: Buffer[];
    newOffset: number;
  }> {
    const updatesKey = getUpdatesKey(this.name);
    const offsetKey = getOffsetKey(this.name);

    // LTRIM updates + SET new offset

    const [updates, newOffset] = (await this.redis.eval(
      COMPACT_SCRIPT,
      2,
      updatesKey,
      offsetKey,
    )) as [Buffer[], number];

    return { updates, newOffset };
  }
}
