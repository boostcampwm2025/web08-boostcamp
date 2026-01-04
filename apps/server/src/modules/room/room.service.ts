import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

/** 방의 생명 주기 관리 */

@Injectable()
export class RoomService {
  constructor(@Inject('REDIS_CLIENT') private redis: Redis) {}

  /**
   * 방 존재 여부 확인 (GET /api/room/:roomId/exists 용)
   */
  async roomExists(roomId: string): Promise<boolean> {
    const keys = await this.redis.keys(`room:${roomId}:*`);
    return keys.length > 0;
  }
}
