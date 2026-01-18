import * as Y from 'yjs';
import { createMutex, mutex } from 'lib0/mutex';
import { Logger } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { YRedis } from './y-redis.types';
import { getUpdatesKey, getOffsetKey } from './y-redis.utils';
import { COMPACT_SCRIPT, PUSH_UPDATE_SCRIPT } from './y-redis.constants';
import type {
  IPersistenceDoc,
  CompactionResult,
  UpdateHandler,
} from './y-redis.types';

export class PersistenceDoc implements IPersistenceDoc {
  private readonly logger = new Logger(PersistenceDoc.name);

  private readonly key: string;
  private readonly mtx: mutex;

  private _clock = 0;
  private _fetchingClock = 0;
  private _totalByteLength = 0;
  private readonly updateHandler: UpdateHandler;

  public readonly synced: Promise<PersistenceDoc>;

  constructor(
    private readonly redis: YRedis,
    private readonly sub: Redis,
    private readonly docs: Map<string, PersistenceDoc>,
    public readonly name: string,
    public readonly doc: Y.Doc,
  ) {
    this.mtx = createMutex();

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

  async destroy(): Promise<void> {
    this.doc.off('update', this.updateHandler);
    this.docs.delete(this.name);
    await this.sub.unsubscribe(this.name);
  }

  async getUpdates(): Promise<PersistenceDoc> {
    const startClock = this._clock;

    // Read offset from Redis (defaults to 0 if not exists)
    const offsetStr = await this.redis.get(getOffsetKey(this.name));
    const offset = offsetStr ? parseInt(offsetStr, 10) : 0;

    // Calculate physical index
    const physicalStartIndex = startClock - offset;

    const updates = await this.redis.lrangeBuffer(
      getUpdatesKey(this.name),
      physicalStartIndex,
      -1,
    );

    const message = `Fetched ${updates.length} updates for ${this.name}`;
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

    return this.getUpdates();
  }

  async compact(): Promise<CompactionResult> {
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

    return { snapshot, clock: newOffset };
  }

  private async pushUpdate(
    update: Buffer,
  ): Promise<{ len: number; offset: number }> {
    const updatesKey = getUpdatesKey(this.name);
    const offsetKey = getOffsetKey(this.name);

    // Execute Lua script atomically
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

  private async consumeUpdates(): Promise<{
    updates: Buffer[];
    newOffset: number;
  }> {
    const updatesKey = getUpdatesKey(this.name);
    const offsetKey = getOffsetKey(this.name);

    // Execute Lua script atomically

    const [updates, newOffset] = (await this.redis.eval(
      COMPACT_SCRIPT,
      2,
      updatesKey,
      offsetKey,
    )) as [Buffer[], number];

    return { updates, newOffset };
  }
}
