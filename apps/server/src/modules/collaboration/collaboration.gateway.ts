import {
  SOCKET_EVENTS,
  type FileUpdatePayload,
  type AwarenessUpdatePayload,
  type JoinRoomPayload,
} from '@codejam/common';
import { OnModuleInit, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CollaborationService } from './collaboration.service';
import type { CollabSocket } from './collaboration.types';
import { PermissionGuard } from './guards/permission.guard';

@WebSocketGateway({
  cors: {
    origin: '*', // 개발용: 모든 출처 허용 (배포 시 프론트 주소로 변경)
  },
})
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  constructor(private readonly collaborationService: CollaborationService) {}

  @WebSocketServer()
  server: Server;

  // ==================================================================
  // Lifecycle
  // ==================================================================

  onModuleInit() {
    this.collaborationService.subscribeToRedisExpiration(this.server);
  }

  // ==================================================================
  // Entry Points
  // ==================================================================

  handleConnection(client: CollabSocket) {
    this.collaborationService.handleConnection(client);
  }

  async handleDisconnect(client: CollabSocket) {
    await this.collaborationService.handleDisconnect(client, this.server);
  }

  @SubscribeMessage(SOCKET_EVENTS.JOIN_ROOM)
  async handleJoinRoom(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    await this.collaborationService.handleJoinRoom(
      client,
      this.server,
      payload,
    );
  }

  @SubscribeMessage(SOCKET_EVENTS.REQUEST_DOC)
  handleRequestDoc(@ConnectedSocket() client: CollabSocket) {
    this.collaborationService.handleRequestDoc(client, this.server);
  }

  @SubscribeMessage(SOCKET_EVENTS.REQUEST_AWARENESS)
  handleRequestAwareness(@ConnectedSocket() client: CollabSocket) {
    this.collaborationService.handleRequestAwareness(client, this.server);
  }

  @UseGuards(PermissionGuard)
  @SubscribeMessage(SOCKET_EVENTS.UPDATE_FILE)
  handleFileUpdate(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: FileUpdatePayload,
  ) {
    this.collaborationService.handleFileUpdate(client, this.server, payload);
  }

  @UseGuards(PermissionGuard)
  @SubscribeMessage(SOCKET_EVENTS.UPDATE_AWARENESS)
  handleAwarenessUpdate(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: AwarenessUpdatePayload,
  ) {
    this.collaborationService.handleAwarenessUpdate(
      client,
      this.server,
      payload,
    );
  }
}
