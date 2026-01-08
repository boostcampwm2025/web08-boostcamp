import {
  SOCKET_EVENTS,
  type FileUpdatePayload,
  type AwarenessUpdatePayload,
  type JoinRoomPayload,
} from '@codejam/common';
import { UseGuards } from '@nestjs/common';
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
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly collaborationService: CollaborationService) {}

  @WebSocketServer()
  server: Server;

  /** 클라이언트 연결 시 초기화 */
  handleConnection(client: CollabSocket) {
    this.collaborationService.handleConnection(client);
  }

  /** 클라이언트 연결 종료 시 정리 및 참가자 상태 업데이트 */
  async handleDisconnect(client: CollabSocket) {
    await this.collaborationService.handleDisconnect(client, this.server);
  }

  /** C -> S: 방 입장 요청 */
  @SubscribeMessage(SOCKET_EVENTS.JOIN_ROOM)
  async handleJoinRoom(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    try {
      await this.collaborationService.handleJoinRoom(
        client,
        this.server,
        payload,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'UNKNOWN_ERROR';
      client.emit('error', {
        type: errorMessage,
        message: errorMessage,
      });
    }
  }

  /** C -> S: 문서 동기화 요청 */
  @SubscribeMessage(SOCKET_EVENTS.REQUEST_DOC)
  handleRequestDoc(@ConnectedSocket() client: CollabSocket) {
    this.collaborationService.handleRequestDoc(client, this.server);
  }

  /** C -> S: Awareness 동기화 요청 */
  @SubscribeMessage(SOCKET_EVENTS.REQUEST_AWARENESS)
  handleRequestAwareness(@ConnectedSocket() client: CollabSocket) {
    this.collaborationService.handleRequestAwareness(client, this.server);
  }

  /** C -> S: 파일 변경사항 브로드캐스트 */
  @UseGuards(PermissionGuard)
  @SubscribeMessage(SOCKET_EVENTS.UPDATE_FILE)
  handleFileUpdate(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: FileUpdatePayload,
  ) {
    this.collaborationService.handleFileUpdate(client, this.server, payload);
  }

  /** C -> S: Awareness 변경사항 브로드캐스트 */
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

  /**
   * [Scheduler용]
   */
  notifyAndDisconnectRoom(roomCode: string) {
    this.collaborationService.handleRoomExpired(this.server, roomCode);
  }
}
