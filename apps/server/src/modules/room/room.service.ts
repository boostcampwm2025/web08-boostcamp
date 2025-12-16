import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { SessionResponseDto } from '@codejam/common';

@Injectable()
export class RoomService {
  // TODO: 현재 닉네임과 색깔 중복 가능 랜덤입니다. 고유성 보장을 위한 수정 필요.(UserStory2, Task4)
  private readonly nicknames = [
    'Alice',
    'Bob',
    'Charlie',
    'Dave',
    'Eve',
    'Frank',
  ];
  private readonly colors = [
    '#ef4444',
    '#22c55e',
    '#3b82f6',
    '#eab308',
    '#a855f7',
    '#ec4899',
  ];

  constructor(@Inject('REDIS_CLIENT') private redis: Redis) {}

  async createSession(): Promise<SessionResponseDto> {
    const sessionId = uuidv4();
    const nickname =
      this.nicknames[Math.floor(Math.random() * this.nicknames.length)];
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    const joinedAt = Date.now();

    const session: SessionResponseDto = {
      sessionId,
      nickname,
      color,
      joinedAt,
    };

    await this.redis.set(
      `room:prototype:session:${sessionId}`,
      JSON.stringify(session),
    );

    return session;
  }
}
