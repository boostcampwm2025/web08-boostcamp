import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Redis } from 'ioredis';
import { Room } from './room.entity';

/** 방의 생명 주기 관리 */

@Injectable()
export class RoomService {
  constructor(
    @Inject('REDIS_CLIENT') private redis: Redis,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  /**
   * 방 존재 여부 확인 (GET /api/room/:roomId/exists 용)
   */
  async roomExists(roomId: string): Promise<boolean> {
    const keys = await this.redis.keys(`room:${roomId}:*`);
    return keys.length > 0;
  }
}
