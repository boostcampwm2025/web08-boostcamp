import {
  SOCKET_EVENTS,
  type FileUpdatePayload,
  type AwarenessUpdatePayload,
  type JoinRoomPayload,
  type PtUpdateRolePayload,
  type FilenameCheckPayload,
  type FilenameCheckResultPayload,
  type FileRenamePayload,
  type FileDeletePayload,
  type PtUpdateNamePayload,
  type ClaimHostPayload,
  type ExecuteCodePayload,
  type ChatMessageSendPayload,
} from '@codejam/common';
import { UseFilters, UseGuards } from '@nestjs/common';
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
import { HostGuard } from './guards/host.guard';
import { DestroyRoomGuard } from './guards/destroy-room.guard';
import { CustomRoomGuard } from './guards/custom-room.guard';
import { NotHostGuard } from './guards/not-host.guard';
import { WsToken } from '../../common/decorators/ws-token.decorator';
import { Throttle } from '@nestjs/throttler';
import { WsThrottlerGuard } from '../../common/guards/ws-throttler.guard';
import { WsExceptionFilter } from '../../common/filters/ws-exception.filter';

@UseFilters(new WsExceptionFilter())
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
    @WsToken() token: string | null,
  ) {
    try {
      await this.collaborationService.handleJoinRoom(
        client,
        this.server,
        payload,
        token,
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

  /** C -> S: 방 나가기 요청 */
  @SubscribeMessage(SOCKET_EVENTS.LEFT_ROOM)
  async handleLeftRoom(@ConnectedSocket() client: CollabSocket) {
    await this.collaborationService.handleLeftRoom(client, this.server);
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

  /** C -> S PtRole 업데이트 */
  @UseGuards(HostGuard)
  @SubscribeMessage(SOCKET_EVENTS.UPDATE_ROLE_PT)
  async handlePtRoleUpdate(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: PtUpdateRolePayload,
  ) {
    await this.collaborationService.handleUpdatePtRole(
      client,
      this.server,
      payload,
    );
  }

  /** C -> S Pt 이름 업데이트 */
  @SubscribeMessage(SOCKET_EVENTS.UPDATE_NICKNAME_PT)
  async handlePtNameUpdate(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: PtUpdateNamePayload,
  ) {
    await this.collaborationService.handleUpdatePtName(
      client,
      this.server,
      payload,
    );
  }

  /** C -> S 파일 이름 유효성 확인 */
  @UseGuards(PermissionGuard)
  @SubscribeMessage(SOCKET_EVENTS.CHECK_FILENAME)
  async handleCheckFileName(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: FilenameCheckPayload,
  ): Promise<FilenameCheckResultPayload> {
    return await this.collaborationService.handleCheckFileName(client, payload);
  }

  /** C -> S 파일 이름 변경 */
  @UseGuards(PermissionGuard)
  @SubscribeMessage(SOCKET_EVENTS.RENAME_FILE)
  handleRenameFile(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: FileRenamePayload,
  ) {
    this.collaborationService.handleFileRename(this.server, client, payload);
  }

  /** C- > S 파일 삭제 */
  @UseGuards(PermissionGuard)
  @SubscribeMessage(SOCKET_EVENTS.DELETE_FILE)
  handleDeleteFile(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: FileDeletePayload,
  ) {
    this.collaborationService.handleFileDelete(this.server, client, payload);
  }

  /** C -> S 방 폭파 요청 */
  @UseGuards(DestroyRoomGuard)
  @SubscribeMessage(SOCKET_EVENTS.DESTROY_ROOM)
  async handleDestroyRoom(@ConnectedSocket() client: CollabSocket) {
    await this.collaborationService.handleDestroyRoom(client, this.server);
  }

  /** C -> S 호스트 권한 요청 */
  @UseGuards(CustomRoomGuard, NotHostGuard)
  @SubscribeMessage(SOCKET_EVENTS.CLAIM_HOST)
  async handleClaimHost(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: ClaimHostPayload,
  ) {
    await this.collaborationService.handleClaimHost(
      client,
      this.server,
      payload,
    );
  }

  /** C -> S 호스트 권한 요청 수락 */
  @UseGuards(HostGuard)
  @SubscribeMessage(SOCKET_EVENTS.ACCEPT_HOST_CLAIM)
  async handleAcceptHostClaim(@ConnectedSocket() client: CollabSocket) {
    await this.collaborationService.handleAcceptHostClaim(client, this.server);
  }

  /** C -> S 호스트 권한 요청 거절 */
  @UseGuards(HostGuard)
  @SubscribeMessage(SOCKET_EVENTS.REJECT_HOST_CLAIM)
  handleRejectHostClaim(@ConnectedSocket() client: CollabSocket) {
    this.collaborationService.handleRejectHostClaim(client, this.server);
  }

  /** C -> S 채팅 메시지 전송 */
  @SubscribeMessage(SOCKET_EVENTS.CHAT_MESSAGE)
  @UseGuards(WsThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 1000 } })
  async handleChatMessage(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: ChatMessageSendPayload,
  ): Promise<{ success: boolean }> {
    await this.collaborationService.handleChatMessage(
      client,
      this.server,
      payload,
    );
    return { success: true };
  }

  /** C -> S 코드 실행 요청 */
  @UseGuards(PermissionGuard, WsThrottlerGuard)
  @Throttle({ default: { limit: 6, ttl: 60000 } })
  @UseGuards(PermissionGuard)
  @SubscribeMessage(SOCKET_EVENTS.EXECUTE_CODE)
  async handleExecuteCode(
    @ConnectedSocket() client: CollabSocket,
    @MessageBody() payload: ExecuteCodePayload,
  ) {
    await this.collaborationService.handleExecuteCode(
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
