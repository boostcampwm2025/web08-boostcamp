import {
  type FileUpdatePayload,
  type JoinRoomPayload,
  SOCKET_EVENTS,
  Pt,
  type PtLeftPayload,
} from '@codejam/common';
import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from '../room/room.service';

@WebSocketGateway({
  cors: {
    origin: '*', // 개발용: 모든 출처 허용 (배포 시 프론트 주소로 변경)
  },
})
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(CollaborationGateway.name);

  // socketId → { roomId, ptId } 매핑
  private socketMap = new Map<string, { roomId: string; ptId: string }>();

  constructor(private readonly roomService: RoomService) {}

  @WebSocketServer()
  server: Server;

  // ==================================================================
  // Entry Points
  // ==================================================================

  handleConnection(client: Socket) {
    this.processConnection(client);
  }

  handleDisconnect(client: Socket) {
    this.processDisconnect(client);
  }

  @SubscribeMessage(SOCKET_EVENTS.JOIN_ROOM)
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    this.processJoinRoom(client, payload);
  }

  @SubscribeMessage(SOCKET_EVENTS.UPDATE_FILE)
  handleCodeUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: FileUpdatePayload,
  ) {
    this.processCodeUpdate(client, payload);
  }

  // ==================================================================
  // Business Logics
  // ==================================================================

  private processConnection(client: Socket) {
    this.logger.log(`✅ Client Connected: ${client.id}`);
  }

  private async processDisconnect(client: Socket) {
    this.logger.log(`❌ Client Disconnected: ${client.id}`);

    const info = this.socketMap.get(client.id);
    if (!info) return;

    const { roomId, ptId } = info;

    // Redis에서 offline + TTL 5분 설정
    await this.roomService.disconnectPt(roomId, ptId);

    // socketMap에서 제거
    this.socketMap.delete(client.id);

    // 다른 사람들에게 알림
    this.server.to(roomId).emit(SOCKET_EVENTS.PT_DISCONNECT, { ptId });
    this.logger.log(`👋 [DISCONNECT] PtId ${ptId} left room: ${roomId}`);
  }

  private async processJoinRoom(client: Socket, payload: JoinRoomPayload) {
    const { roomId, ptId: requestedPtId } = payload;

    // Socket room 입장
    client.join(roomId);

    // 참가자 생성 또는 복원
    let pt: Pt | null = null;
    if (requestedPtId) {
      pt = await this.roomService.restorePt(roomId, requestedPtId);
    }
    if (!pt) {
      pt = await this.roomService.createPt(roomId);
    }

    // socketMap에 매핑 저장
    this.socketMap.set(client.id, { roomId, ptId: pt.ptId });

    // 현재 참가자 목록 및 코드 조회
    const allPts = await this.roomService.getAllPts(roomId);
    const code = await this.roomService.getCode(roomId);

    this.logger.log(
      `📩 [JOIN] ${pt.nickname} (ptId: ${pt.ptId}) joined room: ${roomId}`,
    );

    // 이벤트 전송
    client.to(roomId).emit(SOCKET_EVENTS.PT_JOINED, { pt }); // 다른 사람들에게
    client.emit(SOCKET_EVENTS.ROOM_PTS, { pts: allPts }); // 본인에게 참가자 목록
    client.emit(SOCKET_EVENTS.ROOM_FILES, { roomId, code }); // 본인에게 현재 코드
  }

  private async processCodeUpdate(client: Socket, payload: FileUpdatePayload) {
    const { roomId, code } = payload;
    this.logger.debug(`📝 [UPDATE] Room: ${roomId}, Length: ${code.length}`);

    // Redis에 코드 저장
    await this.roomService.saveCode(roomId, code);

    // 다른 사람들에게 브로드캐스트
    client.to(roomId).emit(SOCKET_EVENTS.UPDATE_FILE, payload);
  }

  /**
   * Redis TTL 만료로 사용자가 삭제되었을 때 처리하는 로직
   * TODO: Redis keyspace notification으로 호출 예정
   */
  private processPtLeftByTTL(roomId: string, ptId: string) {
    this.logger.log(
      `⏰ [PT_LEFT] PtId ${ptId} removed by TTL in room: ${roomId}`,
    );

    const payload: PtLeftPayload = { ptId };
    this.server.to(roomId).emit(SOCKET_EVENTS.PT_LEFT, payload);
  }
}
