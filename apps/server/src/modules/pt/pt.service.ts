import {
  Pt,
  SOCKET_EVENTS,
  JoinRoomPayload,
  PtLeftPayload,
  PtUpdatePayload,
} from '@codejam/common';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';
import { Server } from 'socket.io';
import { CollabSocket } from '../collaboration/collaboration.types';

@Injectable()
export class PtService {
  private readonly logger = new Logger(PtService.name);

  constructor(@Inject('REDIS_CLIENT') private redis: Redis) {}

  private readonly colors = [
    '#ef4444',
    '#22c55e',
    '#3b82f6',
    '#eab308',
    '#a855f7',
    '#ec4899',
  ];

  // ==================================================================
  // Handle Methods
  // ==================================================================

  handleConnection(client: CollabSocket, server: Server) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(
    client: CollabSocket,
    server: Server,
    payload: { roomId: string; ptId: string },
  ) {
    this.logger.log(`Client disconnected: ${client.id}`);

    const { roomId, ptId } = payload;
    await this.disconnectPt(roomId, ptId);
    server.to(roomId).emit(SOCKET_EVENTS.PT_DISCONNECT, { ptId });
    await this.promoteCandidates(server, roomId);
  }

  async handleJoinRoom(
    client: CollabSocket,
    server: Server,
    payload: JoinRoomPayload,
  ) {
    const { roomId } = payload;
    const ptId = (payload as any).ptId;

    let pt: Pt | null = null;

    // Try to restore if ptId is provided
    if (ptId) {
      pt = await this.restorePt(roomId, ptId);
    }

    // Create new if not found
    if (!pt) {
      pt = await this.createPt(roomId);
    }

    await client.join(roomId);
    client.emit(SOCKET_EVENTS.WELCOME, { myPtId: pt.ptId });
    client.to(roomId).emit(SOCKET_EVENTS.PT_JOINED, { pt });

    const pts = await this.getAllPts(roomId);
    client.emit(SOCKET_EVENTS.ROOM_PTS, { roomId, pts });

    return { pt, roomId };
  }

  async handlePtLeftByTTL(
    server: Server,
    payload: { roomId: string; ptId: string },
  ) {
    const { roomId, ptId } = payload;
    server.to(roomId).emit(SOCKET_EVENTS.PT_LEFT, { ptId });

    this.logger.log(`⏰ [PT_LEFT] PtId ${ptId} removed by TTL`);

    await this.promoteCandidates(server, roomId);
  }

  // ==================================================================
  // 참가자 관리
  // ==================================================================

  /**
   * 새 참가자 생성 + Redis 저장
   */
  async createPt(roomId: string): Promise<Pt> {
    const ptId = uuidv4();
    const nickname = this.generateRandomNickname();

    const [color, role] = await Promise.all([
      this.generateRandomColor(roomId),
      this.generateRole(roomId),
    ]);

    const pt: Pt = {
      ptId,
      nickname,
      color,
      role,
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
    return data ? (JSON.parse(data) as Pt) : null;
  }

  /**
   * Redis에서 특정 roomId와 ptId를 가진 pt 저장
   */
  async setPt(roomId: string, pt: Pt): Promise<void> {
    const key = `room:${roomId}:pt:${pt.ptId}`;
    await this.redis.set(key, JSON.stringify(pt));
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

  /**
   * disconnect 처리: presence를 offline으로 변경 + TTL 1분 설정
   */
  async disconnectPt(roomId: string, ptId: string): Promise<void> {
    const pt = await this.getPt(roomId, ptId);
    if (!pt) return;

    pt.presence = 'offline';
    const key = `room:${roomId}:pt:${ptId}`;
    await this.redis.set(key, JSON.stringify(pt), 'EX', 10); // 10초 TTL
  }

  /**
   * 방의 모든 참가자 조회
   */
  async getAllPts(roomId: string): Promise<Pt[]> {
    const keys = await this.redis.keys(`room:${roomId}:pt:*`);
    if (!keys.length) return [];

    const values = await this.redis.mget(keys);
    const pts = values.filter(Boolean).map((v) => JSON.parse(v!));

    return pts.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
  }

  private generateRandomNickname(length: number = 10): string {
    return randomBytes(length * 2)
      .toString('base64')
      .replace(/[^a-z0-9]/gi, '')
      .toLowerCase()
      .substring(0, length);
  }

  private async generateRandomColor(roomId: string): Promise<string> {
    const pts = await this.getAllPts(roomId);
    const numColors = 6;
    const ptColors = pts.slice(-numColors).map((pt) => pt.color);
    const availableColors = this.colors.filter(
      (color) => !ptColors.includes(color),
    );

    const colors = availableColors.length > 0 ? availableColors : this.colors;
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private async generateRole(roomId: string) {
    const numMaxEditor = 6;

    const pts = await this.getAllPts(roomId);
    if (pts.length < numMaxEditor) return 'editor';

    return 'viewer';
  }

  private async promoteCandidates(server: Server, roomId: string) {
    const numMaxEditor = 6;

    const pts = await this.getAllPts(roomId);
    const editors = pts.filter((p) => p.role === 'editor');
    const viewers = pts.filter((p) => p.role === 'viewer');

    const vacancies = numMaxEditor - editors.length;

    if (vacancies > 0 && viewers.length > 0) {
      const candidates = viewers.slice(0, vacancies);

      for (const candidate of candidates) {
        candidate.role = 'editor';
        await this.setPt(roomId, candidate);

        const updatePayload: PtUpdatePayload = { roomId, pt: candidate };
        server.to(roomId).emit(SOCKET_EVENTS.UPDATE_PT, updatePayload);
      }
    }
  }
}
