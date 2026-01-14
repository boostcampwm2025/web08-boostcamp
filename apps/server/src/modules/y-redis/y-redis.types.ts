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

export type UpdateHandler = (update: Uint8Array) => void;
