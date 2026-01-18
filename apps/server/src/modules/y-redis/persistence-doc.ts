import * as Y from 'yjs';
import { createMutex, mutex } from 'lib0/mutex';
import { Logger } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { YRedis } from './y-redis.types';
import { getUpdatesKey, getOffsetKey } from './y-redis.utils';
import {
  REDIS_KEY_TTL,
  MAX_UPDATES_COUNT,
  MAX_UPDATES_SIZE_BYTES,
  COMPACT_SCRIPT,
  PUSH_UPDATE_SCRIPT,
  FETCH_UPDATES_SCRIPT,
} from './y-redis.constants';
import type {
  IPersistenceDoc,
  CompactionResult,
  UpdateHandler,
  GetLatestDocStateCallback,
  UpdateDocStateCallback,
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
 * - **getLatestDocState**: Provided at construction, called during clock inconsistency recovery
 *   Returns { snapshot, clock } from persistent storage (e.g., database)
 * - **onCompact**: Provided to compact(), called on compaction
 *   Receives CompactionResult to save to persistent storage
 *
 * Initialization:
 * - Pass initial snapshot and initial clock to bind()
 * - Snapshot is applied in constructor before update handler attachment
 *
 * Consistency guarantee:
 * - When `clock < offset`, triggers snapshot reload via `getLatestDocState` callback
 * - This can happen if database snapshot is stale
 * - getUpdates() implements exponential backoff retry with snapshot reload
 */
export class PersistenceDoc implements IPersistenceDoc {
  private readonly logger = new Logger(PersistenceDoc.name);

  private readonly mtx: mutex;

  private _clock = 0;
  private _fetchingClock = 0;
  private _updatesByteLength = 0;
  private _snapshotByteLength = 0;
  private readonly updateHandler: UpdateHandler;
  private readonly getLatestDocState: GetLatestDocStateCallback;
  private readonly updateDocState: UpdateDocStateCallback;

  public readonly synced: Promise<PersistenceDoc>;

  constructor(
    private readonly redis: YRedis,
    private readonly sub: Redis,
    public readonly name: string,
    public readonly doc: Y.Doc,

    snapshot: Uint8Array | null,
    clock: number,

    getLatestDocState: GetLatestDocStateCallback,
    updateDocState: UpdateDocStateCallback,
  ) {
    this.mtx = createMutex();

    this._clock = clock;
    this._fetchingClock = clock;

    this.getLatestDocState = getLatestDocState;
    this.updateDocState = updateDocState;

    this.updateHandler = (update: Uint8Array) => {
      // mtx: only store update in redis if this document update does not originate from redis
      this.mtx(() => {
        this._updatesByteLength += update.byteLength;

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

            // Compact if threshold exceeded

            if (this.shouldCompact(len, this._updatesByteLength)) {
              const compactMessage = `Compaction triggered for 
                ${this.name} (${len} updates of ${this._updatesByteLength} bytes)`;
              this.logger.log(compactMessage);

              this.compact(this.updateDocState).catch((err) => {
                const errorMessage = `Compaction failed: ${err.message}`;
                this.logger.error(errorMessage);
              });
            }
          })
          .catch((err) => {
            const message = `Failed to push update to Redis: ${err.message}`;
            this.logger.error(message);
          });
      });
    };

    // Restore Y.Doc state from snapshot before applying incremental updates

    if (snapshot) {
      Y.applyUpdate(this.doc, snapshot);
      this._snapshotByteLength = snapshot.byteLength;
      this._updatesByteLength = 0;
    } else if (doc.store.clients.size > 0) {
      this.updateHandler(Y.encodeStateAsUpdate(doc));
    }

    // Fetch existing updates from Redis

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

  get updatesByteLength(): number {
    return this._updatesByteLength;
  }

  get snapshotByteLength(): number {
    return this._snapshotByteLength;
  }

  async destroy(): Promise<void> {
    this.doc.off('update', this.updateHandler);
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
          Y.applyUpdate(this.doc, update);
          this._updatesByteLength += update.byteLength;
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

    const { snapshot, clock: snapshotClock } = await this.getLatestDocState();
    if (!snapshot) return this;

    const reloadMessage = `Reloaded snapshot: clock=${snapshotClock}, 
      snapshot size=${snapshot.byteLength} bytes`;
    this.logger.log(reloadMessage);

    // Apply snapshot and update clock

    this.mtx(() => {
      this.doc.transact(() => {
        Y.applyUpdate(this.doc, snapshot);

        this._clock = snapshotClock;
        this._fetchingClock = snapshotClock;
        this._snapshotByteLength = snapshot.byteLength;
        this._updatesByteLength = 0;
      });
    });

    // Retry getUpdates

    return this.getUpdates(currentRetries + 1);
  }

  async compact(
    onCompact?: (snapshot: Uint8Array, clock: number) => Promise<void>,
  ): Promise<CompactionResult> {
    // Capture current clock
    const targetClock = this._clock;

    // Generate snapshot from current Y.doc state
    // Y.doc already contains the full state
    const snapshot = Y.encodeStateAsUpdate(this.doc);

    // Save to data first - this ensures crash safety
    // If we crash after database save but before Redis compact,
    // Redis will have redundant updates, which is safe due to Yjs idempotency
    if (onCompact) {
      await onCompact(snapshot, targetClock);
    }

    // Now compact Redis up to target clock
    // This ensures snapshot and offset are synchronized
    const { updates, newOffset } = await this.consumeUpdates(targetClock);

    const message = `Compacted ${updates.length} updates for ${this.name}`;
    this.logger.debug(message);

    this._snapshotByteLength = snapshot.byteLength;
    this._updatesByteLength = 0;

    const compactMessage = `Compacted ${this.name}:
      removed ${updates.length} updates, new offset: ${newOffset}`;
    this.logger.log(compactMessage);

    return { snapshot, clock: newOffset };
  }

  private shouldCompact(
    updatesLength: number,
    updatesByteLength: number,
  ): boolean {
    const isTooManyUpdates = updatesLength > MAX_UPDATES_COUNT;
    const isTooLargeUpdates = updatesByteLength > MAX_UPDATES_SIZE_BYTES;

    return isTooManyUpdates || isTooLargeUpdates;
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
      REDIS_KEY_TTL,
    )) as [number, number];

    return { len, offset };
  }

  private async fetchUpdates(
    clock: number,
  ): Promise<{ updates: Buffer[]; offset: number }> {
    const updatesKey = getUpdatesKey(this.name);
    const offsetKey = getOffsetKey(this.name);

    // LRANGE updates + GET offset

    const [updates, offset] = (await this.redis.evalBuffer(
      FETCH_UPDATES_SCRIPT,
      2,
      updatesKey,
      offsetKey,
      clock,
      REDIS_KEY_TTL,
    )) as [Buffer[], number];

    return { updates, offset };
  }

  private async consumeUpdates(clock: number): Promise<{
    updates: Buffer[];
    newOffset: number;
  }> {
    const updatesKey = getUpdatesKey(this.name);
    const offsetKey = getOffsetKey(this.name);

    // LTRIM updates + SET new offset

    const [updates, newOffset] = (await this.redis.evalBuffer(
      COMPACT_SCRIPT,
      2,
      updatesKey,
      offsetKey,
      clock,
    )) as [Buffer[], number];

    return { updates, newOffset };
  }
}
