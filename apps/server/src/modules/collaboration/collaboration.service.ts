import {
  SOCKET_EVENTS,
  type JoinRoomPayload,
  type FileUpdatePayload,
  type AwarenessUpdatePayload,
  type Pt,
  type RoomToken,
  type PtUpdateRolePayload,
  type FilenameCheckResultPayload,
  type FilenameCheckPayload,
  type FileRenamePayload,
  type FileDeletePayload,
  type PtUpdateNamePayload,
} from '@codejam/common';
import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { CollabSocket } from './collaboration.types';
import { PtService } from '../pt/pt.service';
import { FileService } from '../file/file.service';
import { RoomService } from '../room/room.service';
import { RoomTokenService } from '../auth/room-token.service';
import { DocumentService } from '../document/document.service';
import { PtRole } from '../pt/pt.entity';
import { Room } from '../room/room.entity';
import { Document } from '../document/document.entity';

@Injectable()
export class CollaborationService {
  private readonly logger = new Logger(CollaborationService.name);

  constructor(
    private readonly ptService: PtService,
    private readonly fileService: FileService,
    private readonly roomService: RoomService,
    private readonly roomTokenService: RoomTokenService,
    private readonly documentService: DocumentService,
  ) {}

  /** 클라이언트 연결 시 초기화 */
  handleConnection(client: CollabSocket): void {
    this.ptService.handleConnection(client);
  }

  /** 클라이언트 연결 종료 시 정리 */
  async handleDisconnect(client: CollabSocket, server: Server): Promise<void> {
    await this.ptService.handleDisconnect(client, server);
  }

  /** 방 입장: 참가자 생성/복원, 소켓 룸 참여, 초기 데이터 전송 */
  async handleJoinRoom(
    client: CollabSocket,
    server: Server,
    payload: JoinRoomPayload,
  ): Promise<void> {
    const { roomCode: rawRoomCode, token, nickname, password } = payload;
    const roomCode = rawRoomCode.toUpperCase(); // 대문자 변환

    // 방 유효성 검사
    const room = await this.roomService.findRoomByCode(roomCode);
    if (!room) throw new Error('ROOM_NOT_FOUND');

    const roomId = room.roomId;

    // 토큰 검증 및 ptId 추출
    let ptId: string | null = null;

    if (token) {
      const tokenPayload = this.roomTokenService.verify(token);
      if (!tokenPayload) {
        throw new Error('INVALID_TOKEN');
      }
      // 토큰의 roomCode와 요청 roomCode 일치 여부 확인
      if (tokenPayload.roomCode.toUpperCase() !== roomCode) {
        throw new Error('TOKEN_ROOM_MISMATCH');
      }
      ptId = tokenPayload.ptId;
    }

    // 참가자 조회 또는 생성
    let pt: Pt | null = null;

    // ptId가 있으면 DB에서 조회 (호스트 또는 재접속 유저)
    if (ptId) {
      pt = await this.ptService.restorePt(roomId, ptId);
    }

    // 신규 유저는 패스워드와 닉네임 필수
    if (!pt) {
      if (room.roomPassword && !password) {
        throw new Error('PASSWORD_REQUIRED');
      }
      if (room.roomPassword && room.roomPassword !== password) {
        throw new Error('PASSWORD_UNCORRECT');
      }
      if (!nickname) {
        throw new Error('NICKNAME_REQUIRED');
      }
      pt = await this.ptService.createPt(roomId, nickname);
    }

    // 새 토큰 발급
    const newToken = this.roomTokenService.sign({
      roomCode,
      ptId: pt.ptId,
    });

    // 문서 조회
    const doc = await this.documentService.getDocByRoomId(roomId);
    if (!doc) throw new Error('DOCUMENT_NOT_FOUND');

    // socket.data 설정
    this.setupSocketData(client, room, pt, doc);
    await client.join(roomCode);

    // Y.Doc 준비
    await this.fileService.prepareDoc(client, server);

    await this.notifyParticipantJoined(client, server, pt, newToken, room);

    this.logger.log(
      `[JOIN_ROOM] ${pt.ptId} joined room ${roomCode} as ${pt.role}`,
    );
  }

  /** 방 나가기 */
  async handleLeftRoom(client: CollabSocket, server: Server): Promise<void> {
    const { roomId, roomCode, ptId, role } = client.data;
    if (!roomId || !roomCode || !ptId) return;

    // 참가자 삭제 및 다른 참가자들에게 알림

    await this.ptService.deletePt(roomId, ptId);

    client.emit(SOCKET_EVENTS.GOODBYE);
    server.to(roomCode).emit(SOCKET_EVENTS.PT_LEFT, { ptId });

    await client.leave(roomCode);

    this.logger.log(`[LEFT_ROOM] ptId: ${ptId} left room ${roomCode}`);

    // TODO: Host Transfer
    // Host 가 나갔다면 다른 참가자를 찾아서 Promote

    if (role == PtRole.HOST) {
      // const newHostPtId = ...;
      // updatePtRole(newHostPtId, PtRole.HOST)
    }

    // TODO: Destroy Room
    // 참가자가 없으면 방을 폭파

    const hasParticipants = await this.ptService.hasParticipants(roomId);

    if (!hasParticipants) {
      // await this.roomService.destroyRoom(roomId);
    }
  }

  /** 초기 로드: 문서 상태 요청 */
  handleRequestDoc(client: CollabSocket, server: Server): void {
    const { docId } = client.data;
    if (!docId) return;

    this.fileService.handleRequestDoc(client, server);
  }

  /** 초기 로드: Awareness 상태 요청 */
  handleRequestAwareness(client: CollabSocket, server: Server): void {
    const { docId } = client.data;
    if (!docId) return;

    this.fileService.handleRequestAwareness(client, server);
  }

  /** 파일 변경사항 브로드캐스트 */
  handleFileUpdate(
    client: CollabSocket,
    server: Server,
    payload: FileUpdatePayload,
  ): void {
    const { docId } = client.data;
    if (!docId) return;

    this.fileService.handleFileUpdate(client, server, payload);
  }

  /** Awareness 변경사항 브로드캐스트 */
  handleAwarenessUpdate(
    client: CollabSocket,
    server: Server,
    payload: AwarenessUpdatePayload,
  ): void {
    const { docId } = client.data;
    if (!docId) return;

    this.fileService.handleAwarenessUpdate(client, server, payload);
  }

  /** 참가자 권한 업데이트 */
  async handleUpdatePtRole(
    client: CollabSocket,
    server: Server,
    payload: PtUpdateRolePayload,
  ): Promise<void> {
    const { roomId } = client.data;
    const { ptId, role } = payload;

    await this.ptService.updatePt(client, server, ptId, {
      role: role === 'editor' ? PtRole.EDITOR : PtRole.VIEWER,
    });

    const pt = await this.ptService.getPt(roomId, ptId);
    if (!pt) return;

    this.notifyUpdatePt(client, server, pt);
  }

  /** 참가자 이름 업데이트 */
  async handleUpdatePtName(
    client: CollabSocket,
    server: Server,
    payload: PtUpdateNamePayload,
  ): Promise<void> {
    const { roomId } = client.data;
    const { ptId, nickname } = payload;

    await this.ptService.updatePt(client, server, ptId, { nickname });

    const pt = await this.ptService.getPt(roomId, ptId);
    if (!pt) return;

    this.notifyUpdatePt(client, server, pt);
  }

  /** 파일 이름 유효성 확인 */
  async handleCheckFileName(
    client: CollabSocket,
    payload: FilenameCheckPayload,
  ): Promise<FilenameCheckResultPayload> {
    const currentExts = [
      'mjs',
      'cjs',
      'js',
      'ts',
      'tsx',
      'jsx',
      'htm',
      'html',
      'css',
    ];
    const extResult = {
      error: true,
      type: 'ext',
      message: '유효하지 않는 확장자입니다.',
    } as FilenameCheckResultPayload;

    const { filename } = payload;
    const { roomId, docId } = client.data;

    const room = await this.roomService.findRoomById(roomId);

    if (!room) {
      return {
        error: true,
        type: 'no_room',
        message: '유효하지 않는 방입니다.',
      };
    }

    const lastDot = filename.trim().lastIndexOf('.');

    if (lastDot === -1) {
      return extResult;
    }

    const ext = filename
      .trim()
      .substring(lastDot + 1)
      .toLowerCase();

    if (!currentExts.includes(ext)) {
      return extResult;
    }

    if (this.fileService.checkDuplicate(docId, filename)) {
      return {
        error: true,
        type: 'duplicate',
        message: '중복되는 파일명입니다.',
      };
    }

    return {
      error: false,
    };
  }

  /** 파일 이름 변경 */
  handleFileRename(
    server: Server,
    client: CollabSocket,
    payload: FileRenamePayload,
  ) {
    const { fileId, newName } = payload;
    const { docId } = client.data;
    this.fileService.renameFile(docId, fileId, newName, client, server);
  }

  /** 파일 삭제 */
  handleFileDelete(
    server: Server,
    client: CollabSocket,
    payload: FileDeletePayload,
  ) {
    const { fileId } = payload;
    const { docId } = client.data;
    this.fileService.deleteFile(docId, fileId, client, server);
  }

  /** 소켓 데이터 설정 */
  private setupSocketData(
    client: CollabSocket,
    room: Room,
    pt: Pt,
    doc: Document,
  ): void {
    client.data.roomId = room.roomId;
    client.data.roomCode = room.roomCode;
    client.data.docId = doc.docId;
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
    pt: Pt,
    token: RoomToken,
    room: Room,
  ): Promise<void> {
    const { roomId, roomCode } = client.data;

    // 본인에게: 내 ptId 및 토큰 전달
    client.emit(SOCKET_EVENTS.WELCOME, {
      myPtId: pt.ptId,
      token,
      roomType: room.roomType,
      whoCanDestroyRoom: room.whoCanDestroyRoom,
    });

    // 다른 참가자들에게: 새 참가자 입장 알림
    client.to(roomCode).emit(SOCKET_EVENTS.PT_JOINED, { pt });

    // 본인에게: 현재 방의 모든 참가자 목록 전달
    const pts = await this.ptService.getAllPts(roomId);
    client.emit(SOCKET_EVENTS.ROOM_PTS, { pts });
  }

  /** 참가자 정보 업데이트 데이터 전송 */
  private notifyUpdatePt(client: CollabSocket, server: Server, pt: Pt): void {
    const { roomCode } = client.data;
    server.to(roomCode).emit(SOCKET_EVENTS.UPDATE_PT, { pt });
  }

  /**
   * 방 폭파 처리
   * 1. 모든 클라이언트에게 알림
   * 2. 소켓 연결 종료
   * 3. 데이터 정리 (DB 삭제 + Y.Doc 메모리 해제)
   */
  async handleDestroyRoom(client: CollabSocket, server: Server): Promise<void> {
    const { roomId, roomCode, docId } = client.data;

    this.logger.log(`[DESTROY_ROOM] Destroying room: ${roomCode}`);

    // 1. 모든 클라이언트에게 폭파 알림
    server.to(roomCode).emit(SOCKET_EVENTS.ROOM_DESTROYED, {});

    // 2. 소켓 연결 종료
    server.in(roomCode).disconnectSockets(true);

    // 3. 데이터 정리
    await this.roomService.destroyRoom(roomId, docId);

    this.logger.log(`[DESTROY_ROOM] Room ${roomCode} destroyed successfully`);
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
