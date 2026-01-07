import {
  type JoinRoomPayload,
  type FileUpdatePayload,
  type AwarenessUpdatePayload,
} from '@codejam/common';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { CollabSocket } from './collaboration.types';
import { Redis } from 'ioredis';
import { PtService } from '../pt/pt.service';
import { FileService } from '../file/file.service';
import { RoomService } from '../room/room.service';

@Injectable()
export class CollaborationService {
  private readonly logger = new Logger(CollaborationService.name);

  constructor(
    private readonly ptService: PtService,
    private readonly fileService: FileService,
    private readonly roomService: RoomService,
    @Inject('REDIS_SUBSCRIBER') private readonly redisSubscriber: Redis,
  ) {}

  /**
   * Subscribe to Redis expiration events
   * Called from gateway's onModuleInit
   */
  async subscribeToRedisExpiration(server: Server) {
    // __keyevent@0__:expired 채널 구독 (DB 0번의 만료 이벤트)
    await this.redisSubscriber.subscribe('__keyevent@0__:expired');

    this.redisSubscriber.on('message', (channel, expiredKey) => {
      if (channel !== '__keyevent@0__:expired') return;

      // 키 형식: room:{roomId}:pt:{ptId}
      const match = expiredKey.match(/^room:(.+):pt:(.+)$/);
      if (!match) return;

      const [, roomId, ptId] = match;
      this.handlePtLeftByTTL(server, { roomId, ptId });
    });

    this.logger.log('🔔 Subscribed to Redis keyspace expiration events');
  }

  /**
   * Handle client connection
   */
  handleConnection(client: CollabSocket): void {
    this.ptService.handleConnection(client);
  }

  /**
   * Handle client disconnection
   */
  async handleDisconnect(client: CollabSocket, server: Server): Promise<void> {
    const { roomCode, ptId, clientId } = client.data;
    if (!roomCode || !ptId) return;

    // Clean up awareness states
    if (clientId) {
      this.fileService.handleRemoveAwareness(client, server, {
        roomId: roomCode,
        clientId,
      });
    }

    // Clean up participant
    await this.ptService.handleDisconnect(client, server, {
      roomId: roomCode,
      ptId,
    });
  }

  /**
   * Handle join room request
   */
  async handleJoinRoom(
    client: CollabSocket,
    server: Server,
    payload: JoinRoomPayload,
  ): Promise<void> {
    // Delegate to PT service
    const { pt, roomCode } = await this.ptService.handleJoinRoom(
      client,
      server,
      payload,
    );

    // Find roomId by roomCode
    const roomId = await this.roomService.findRoomIdByCode(roomCode);
    if (!roomId) {
      this.logger.error(`Room not found: roomCode=${roomCode}`);
      client.emit('error', {
        type: 'ROOM_NOT_FOUND',
        message: '방을 찾을 수 없습니다',
      });
      return;
    }

    // Store in socket.data
    client.data.roomId = roomId;
    client.data.roomCode = roomCode;
    client.data.ptId = pt.ptId;

    // TODO: Change file creation timing
    // Create file if not exists (idempotent)

    const fileId = 'prototype';

    this.fileService.handleCreateFile(client, server, {
      roomId: roomCode,
      fileId,
    });
  }

  /**
   * Handle document request
   */
  handleRequestDoc(client: CollabSocket, server: Server): void {
    const { roomCode } = client.data;
    if (!roomCode) return;

    this.fileService.handleRequestDoc(client, server, { roomId: roomCode });
  }

  /**
   * Handle awareness request
   */
  handleRequestAwareness(client: CollabSocket, server: Server): void {
    const { roomCode } = client.data;
    if (!roomCode) return;

    // TODO: fileService 부분은 아직 수정 전. 타입오류만 안나게 해둠.
    this.fileService.handleRequestAwareness(client, server, {
      roomId: roomCode,
    });
  }

  /**
   * Handle file update
   */
  handleFileUpdate(
    client: CollabSocket,
    server: Server,
    payload: FileUpdatePayload,
  ): void {
    const { roomCode } = client.data;
    if (!roomCode) return;

    const { message } = payload;

    this.fileService.handleFileUpdate(client, server, {
      roomId: roomCode,
      message,
    });
  }

  /**
   * Handle awareness update
   */
  handleAwarenessUpdate(
    client: CollabSocket,
    server: Server,
    payload: AwarenessUpdatePayload,
  ): void {
    const { roomCode } = client.data;
    if (!roomCode) return;

    const { message } = payload;

    this.fileService.handleAwarenessUpdate(client, server, {
      roomId: roomCode,
      message,
    });
  }

  /**
   * Handle participant left by TTL expiration
   */
  private async handlePtLeftByTTL(
    server: Server,
    payload: { roomId: string; ptId: string },
  ) {
    const { roomId, ptId } = payload;
    await this.ptService.handlePtLeftByTTL(server, { roomId, ptId });
  }
}
