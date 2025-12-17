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

  /**
   * Redis에서 특정 roomId와 ptId를 가진 pt 조회
   */
  async getPt(roomId: string, ptId: string): Promise<Pt | null> {
    const data = await this.redis.get(`room:${roomId}:pt:${ptId}`);
    return data ? JSON.parse(data) : null;
  }

  /**
   * 재접속 시 복원: TTL 제거 + presence를 online으로 변경
   */
  async restorePt(roomId: string, ptId: string): Promise<Pt | null> {
    const pt = await this.getPt(roomId, ptId);
    if (!pt) return null;

    pt.presence = 'online';
    const key = `room:${roomId}:pt:${ptId}`;

    await this.redis.set(key, JSON.stringify(pt));
    await this.redis.persist(key); // TTL 제거

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
