import {
  Injectable,
  Inject,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as Y from 'yjs';
import { Redis } from 'ioredis';
import { YRedis } from './y-redis.types';
import { getDocKey } from './y-redis.utils';
import { PersistenceDoc } from './persistence-doc';

@Injectable()
export class YRedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(YRedisService.name);
  private readonly docs: Map<string, PersistenceDoc> = new Map();
  private redis: YRedis;
  private sub: Redis;

  constructor(@Inject('REDIS_YJS') private readonly _redis: Redis) {}

  onModuleInit() {
    this.redis = this._redis.duplicate() as YRedis;
    this.sub = this._redis.duplicate();

    this.sub.on('message', (channel: string, sclock: string) => {
      const pdoc = this.docs.get(channel);

      if (!pdoc) {
        this.sub.unsubscribe(channel).catch((err) => {
          const message = `Failed to unsubscribe: ${err.message}`;
          this.logger.error(message);
        });
        return;
      }

      const clock = Number(sclock) || Number.POSITIVE_INFINITY; // case of null

      if (pdoc.fetchingClock < clock) {
        // do not query doc updates if this document is currently already fetching
        const isCurrentlyFetching = pdoc.fetchingClock !== pdoc.clock;

        if (pdoc.fetchingClock < clock) {
          pdoc.fetchingClock = clock;
        }

        if (!isCurrentlyFetching) {
          pdoc.getUpdates().catch((err) => {
            this.logger.error(`Failed to get updates: ${err.message}`);
          });
        }
      }
    });

    const message = 'YRedisService initialized';
    this.logger.log(message);
  }

  async onModuleDestroy() {
    await this.destroy();
  }

  bind(name: string, ydoc: Y.Doc): PersistenceDoc {
    if (this.docs.has(name)) {
      const message = `"${name}" is already bound to this YRedis instance`;
      throw new Error(message);
    }

    const pd = new PersistenceDoc(this.redis, this.sub, this.docs, name, ydoc);
    this.docs.set(name, pd);

    const message = `Bound state for document: ${name}`;
    this.logger.debug(message);
    return pd;
  }

  getDoc(name: string): PersistenceDoc | undefined {
    return this.docs.get(name);
  }

  hasDoc(name: string): boolean {
    return this.docs.has(name);
  }

  async hasDocInRedis(name: string): Promise<boolean> {
    const key = getDocKey(name);
    const result = await this.redis.exists(key);
    return result === 1;
  }

  async closeDoc(name: string): Promise<void> {
    const doc = this.docs.get(name);
    if (doc) {
      await doc.destroy();

      const message = `Closed document: ${name}`;
      this.logger.debug(message);
    }
  }

  async clearDoc(name: string): Promise<number> {
    const doc = this.docs.get(name);
    if (doc) await doc.destroy();

    const key = getDocKey(name);
    const result = await this.redis.del(key);

    const message = `Cleared document: ${name}`;
    this.logger.debug(message);

    return result;
  }

  async clearAllDocs(): Promise<void> {
    const deletePromises = Array.from(this.docs.keys()).map((name) => {
      const key = getDocKey(name);
      return this.redis.del(key);
    });

    await Promise.all(deletePromises);
    await this.destroy();

    const message = 'Cleared all documents';
    this.logger.debug(message);
  }

  async destroy(): Promise<void> {
    const docsToDestroy = Array.from(this.docs.values());
    this.docs.clear();

    await Promise.all(docsToDestroy.map((doc) => doc.destroy()));

    if (this.redis) await this.redis.quit();
    if (this.sub) await this.sub.quit();

    const message = 'YRedisService destroyed';
    this.logger.log(message);
  }
}
