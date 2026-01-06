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

type SocketData = {
  roomId: string;
  ptId: string;
  clientId?: number;
};

@Injectable()
export class CollaborationService {
  private readonly logger = new Logger(CollaborationService.name);
  private socketMap = new Map<string, SocketData>();

  constructor(
    private readonly ptService: PtService,
    private readonly fileService: FileService,
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
  handleConnection(client: CollabSocket, server: Server): void {
    this.ptService.handleConnection(client, server);
  }

  /**
   * Handle client disconnection
   */
  async handleDisconnect(client: CollabSocket, server: Server): Promise<void> {
    const info = this.socketMap.get(client.id);
    if (!info) return;

    const { roomId, ptId, clientId } = info;

    // Clean up awareness states
    if (clientId) {
      this.fileService.handleRemoveAwareness(client, server, {
        roomId,
        clientId,
      });
    }

    // Clean up participant
    await this.ptService.handleDisconnect(client, server, {
      roomId,
      ptId,
    });

    // Remove from socketMap
    this.socketMap.delete(client.id);
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
    const { pt, roomId } = await this.ptService.handleJoinRoom(
      client,
      server,
      payload,
    );

    // Store in socketMap
    this.socketMap.set(client.id, {
      roomId,
      ptId: pt.ptId,
    });

    // TODO: Change file creation timing
    // Create file if not exists (idempotent)

    const fileId = 'prototype';

    this.fileService.handleCreateFile(client, server, {
      roomId,
      fileId,
    });
  }

  /**
   * Handle document request
   */
  handleRequestDoc(client: CollabSocket, server: Server): void {
    const info = this.socketMap.get(client.id);
    if (!info) return;

    const { roomId } = info;
    this.fileService.handleRequestDoc(client, server, { roomId });
  }

  /**
   * Handle awareness request
   */
  handleRequestAwareness(client: CollabSocket, server: Server): void {
    const info = this.socketMap.get(client.id);
    if (!info) return;

    const { roomId } = info;
    this.fileService.handleRequestAwareness(client, server, { roomId });
  }

  /**
   * Handle file update
   */
  handleFileUpdate(
    client: CollabSocket,
    server: Server,
    payload: FileUpdatePayload,
  ): void {
    const info = this.socketMap.get(client.id);
    if (!info) return;

    const { roomId } = info;
    const { message } = payload;

    this.fileService.handleFileUpdate(client, server, {
      roomId,
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
    const info = this.socketMap.get(client.id);
    if (!info) return;

    const { roomId } = info;
    const { message } = payload;

    this.fileService.handleAwarenessUpdate(client, server, {
      roomId,
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
