import * as Y from 'yjs';
import type { Redis } from 'ioredis';

export type YRedis = Redis & RedisBuffer;

export type RedisBuffer = {
  rpushBuffer(key: string, value: Buffer): Promise<number>;
  lrangeBuffer(key: string, start: number, stop: number): Promise<Buffer[]>;
};

export interface YRedisOptions {
  redisClient?: any;
  redisSubscriber?: any;
}

export interface IPersistenceDoc {
  name: string;
  doc: Y.Doc;
  synced: Promise<IPersistenceDoc>;
  destroy(): Promise<void>;
  getUpdates(): Promise<IPersistenceDoc>;
}

/**
 * The result of the compaction process.
 * @field snapshot - A binary Uint8Array representing the integrated state of all Y.Doc updates.
 * @field clock - The offset (logical timestamp) of the last update included in this snapshot.
 */
export interface CompactionResult {
  snapshot: Uint8Array;
  clock: number;
}

export type UpdateHandler = (update: Uint8Array) => void;
