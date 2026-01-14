import * as Y from 'yjs';
import { createMutex, mutex } from 'lib0/mutex';
import { Logger } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { YRedis } from './y-redis.types';
import { getDocKey } from './y-redis.utils';
import type { IPersistenceDoc, UpdateHandler } from './y-redis.types';

export class PersistenceDoc implements IPersistenceDoc {
  private readonly logger = new Logger(PersistenceDoc.name);

  private readonly key: string;
  private readonly mtx: mutex;

  private _clock = 0;
  private _fetchingClock = 0;
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
    this.key = getDocKey(this.name);

    this.updateHandler = (update: Uint8Array) => {
      // mtx: only store update in redis if this document update does not originate from redis
      this.mtx(() => {
        this.redis
          .rpushBuffer(this.key, Buffer.from(update))
          .then((len: number) => {
            if (len === this._clock + 1) {
              this._clock++;
              if (this._fetchingClock < this._clock) {
                this._fetchingClock = this._clock;
              }
            }

            this.redis.publish(this.name, len.toString()).catch((err) => {
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

  async destroy(): Promise<void> {
    this.doc.off('update', this.updateHandler);
    this.docs.delete(this.name);
    await this.sub.unsubscribe(this.name);
  }

  async getUpdates(): Promise<PersistenceDoc> {
    const startClock = this._clock;

    const updates = await this.redis.lrangeBuffer(
      getDocKey(this.name),
      startClock,
      -1,
    );

    const message = `Fetched ${updates.length} updates for ${this.name}`;
    this.logger.debug(message);

    this.mtx(() => {
      this.doc.transact(() => {
        updates.forEach((update) => {
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
}
