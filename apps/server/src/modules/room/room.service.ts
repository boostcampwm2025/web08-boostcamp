import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { Pt } from '@codejam/common';

@Injectable()
export class RoomService {
  constructor(@Inject('REDIS_CLIENT') private redis: Redis) {}

  /**
   * 새 참가자 생성 + Redis 저장
   */
  async createPt(roomId: string): Promise<Pt> {
    const ptId = uuidv4();
    const pt: Pt = {
      ptId,
      nickname: this.generateRandomNickname(),
      color: this.generateRandomColor(),
      role: 'editor',
      presence: 'online',
      joinedAt: new Date().toISOString(),
    };

    await this.redis.set(`room:${roomId}:pt:${ptId}`, JSON.stringify(pt));

    return pt;
  }

  private generateRandomNickname(): string {
    const names = ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve', 'Frank'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private generateRandomColor(): string {
    const colors = [
      '#ef4444',
      '#22c55e',
      '#3b82f6',
      '#eab308',
      '#a855f7',
      '#ec4899',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
