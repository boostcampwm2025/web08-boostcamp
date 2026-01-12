import {
  SOCKET_EVENTS,
  type JoinRoomPayload,
  type FileUpdatePayload,
  type AwarenessUpdatePayload,
  type Pt,
  PtUpdateRolePayload,
} from '@codejam/common';
import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { CollabSocket } from './collaboration.types';
import { PtService } from '../pt/pt.service';
import { FileService } from '../file/file.service';
import { RoomService } from '../room/room.service';
import { PtRole } from '../pt/pt.entity';

@Injectable()
export class CollaborationService {
  private readonly logger = new Logger(CollaborationService.name);

  constructor(
    private readonly ptService: PtService,
    private readonly fileService: FileService,
    private readonly roomService: RoomService,
  ) {}

  /** 클라이언트 연결 시 초기화 */
  handleConnection(client: CollabSocket): void {
    this.ptService.handleConnection(client);
  }

  /** 클라이언트 연결 종료 시 정리 */
  async handleDisconnect(client: CollabSocket, server: Server): Promise<void> {
    const { roomCode, ptId, role } = client.data;
    if (!roomCode || !ptId) return;

    await this.ptService.handleDisconnect(server, roomCode, ptId, role);
  }

  /** 방 입장: 참가자 생성/복원, 소켓 룸 참여, 초기 데이터 전송 */
  async handleJoinRoom(
    client: CollabSocket,
    server: Server,
    payload: JoinRoomPayload,
  ): Promise<void> {
    const { roomCode: rawRoomCode, ptId, nickname } = payload;
    const roomCode = rawRoomCode.toUpperCase(); // 대문자 변환

    console.log(payload);
    // 방 유효성 검사
    const room = await this.roomService.findRoomIdByCode(roomCode);
    if (!room) {
      throw new Error('ROOM_NOT_FOUND');
    }

    // 참가자 조회 또는 생성
    let pt: Pt | null = null;

    // ptId가 있으면 DB에서 조회 (호스트 또는 재접속 유저)
    if (ptId) {
      pt = await this.ptService.restorePt(roomCode, ptId);
    }

    // 신규 유저는 닉네임 필수
    if (!pt) {
      if (!nickname) {
        throw new Error('NICKNAME_REQUIRED');
      }
      pt = await this.ptService.createPt(roomCode, nickname);
    }

    // socket.data 설정
    this.setupSocketData(client, roomCode, pt);
    await client.join(roomCode);

    // 클라이언트가 REQUEST_DOC을 보내기 전에 문서 준비 완료
    this.prepareRoomDoc(client, server, roomCode);

    await this.notifyParticipantJoined(client, server, roomCode, pt);

    this.logger.log(
      `[JOIN_ROOM] ${pt.ptId} joined room ${roomCode} as ${pt.role}`,
    );
  }

  /** 초기 로드: 문서 상태 요청 */
  handleRequestDoc(client: CollabSocket, server: Server): void {
    const { roomCode } = client.data;
    if (!roomCode) return;

    this.fileService.handleRequestDoc(client, server, { roomId: roomCode });
  }

  /** 초기 로드: Awareness 상태 요청 */
  handleRequestAwareness(client: CollabSocket, server: Server): void {
    const { roomCode } = client.data;
    if (!roomCode) return;

    this.fileService.handleRequestAwareness(client, server, {
      roomId: roomCode,
    });
  }

  /** 파일 변경사항 브로드캐스트 */
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

  /** Awareness 변경사항 브로드캐스트 */
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

  /** 참가자 권한 업데이트 */
  async handleUpdatePtRole(
    client: CollabSocket,
    server: Server,
    payload: PtUpdateRolePayload,
  ): Promise<void> {
    const { roomCode } = client.data;
    const { ptId, role } = payload;

    await this.ptService.updatePtRole(
      server,
      roomCode,
      ptId,
      role === 'editor' ? PtRole.EDITOR : PtRole.VIEWER,
    );

    const pt = await this.ptService.getPt(roomCode, ptId);
    if (!pt) {
      return;
    }

    this.notifyUpdatePt(server, roomCode, pt);
  }

  /** 소켓 데이터 설정 */
  private setupSocketData(
    client: CollabSocket,
    roomCode: string,
    pt: Pt,
  ): void {
    client.data.roomCode = roomCode;
    client.data.ptId = pt.ptId;
    client.data.role = pt.role as PtRole;
    client.data.nickname = pt.nickname;
    client.data.color = pt.color;
    client.data.createdAt = pt.createdAt;
  }

  /** 참가자 입장 알림 및 참가자 데이터 전송 */
  private async notifyParticipantJoined(
    client: CollabSocket,
    server: Server,
    roomCode: string,
    pt: Pt,
  ): Promise<void> {
    // 본인에게: 내 ptId 전달
    client.emit(SOCKET_EVENTS.WELCOME, { myPtId: pt.ptId });

    // 다른 참가자들에게: 새 참가자 입장 알림
    client.to(roomCode).emit(SOCKET_EVENTS.PT_JOINED, { pt });

    // 본인에게: 현재 방의 모든 참가자 목록 전달
    const pts = await this.ptService.getAllPts(roomCode);
    client.emit(SOCKET_EVENTS.ROOM_PTS, { pts });
  }

  /** 참가자 정보 업데이트 데이터 전송 */
  private notifyUpdatePt(server: Server, roomCode: string, pt: Pt): void {
    server.to(roomCode).emit(SOCKET_EVENTS.UPDATE_PT, { pt });
  }

  /** 방 문서(Y.Doc) 및 기본 파일 준비 */
  private prepareRoomDoc(
    client: CollabSocket,
    server: Server,
    roomCode: string,
  ): void {
    this.fileService.handleCreateFile(client, server, {
      roomId: roomCode,
      fileId: roomCode,
    });
  }

  /**
   * [Scheduler용] 방 만료 처리 로직
   * - 방에 있는 유저들에게 만료 이벤트 전송
   * - 소켓 연결 강제 종료
   */
  handleRoomExpired(server: Server, roomCode: string): void {
    server.to(roomCode).emit(SOCKET_EVENTS.ROOM_EXPIRED, {
      message: '방 유효 시간이 만료되어 종료되었습니다.',
    });

    server.in(roomCode).disconnectSockets(true);

    this.logger.log(
      `Room [${roomCode}] expired notification sent & sockets disconnected.`,
    );
  }
}
