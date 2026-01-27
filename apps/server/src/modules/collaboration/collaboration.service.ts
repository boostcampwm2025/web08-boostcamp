import {
  SOCKET_EVENTS,
  ERROR_CODE,
  ROLE,
  UPDATABLE_PT_ROLES,
  EXT_TYPES,
  FILENAME_CHECK_RESULT_TYPES,
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
  type ClaimHostPayload,
  type PtRole,
  type PtId,
} from '@codejam/common';
import { WsException } from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { CollabSocket } from './collaboration.types';
import { PtService } from '../pt/pt.service';
import { FileService } from '../file/file.service';
import { RoomService } from '../room/room.service';
import { RoomTokenService } from '../auth/room-token.service';
import { DocumentService } from '../document/document.service';
import { Room } from '../room/room.entity';
import { Document } from '../document/document.entity';

// 호스트 권한 요청 대기 상태 (Service 내부용)
interface PendingClaim {
  requesterId: PtId;
  requesterSocketId: string;
  requesterRole: PtRole;
  timeoutId: NodeJS.Timeout;
}

@Injectable()
export class CollaborationService {
  private readonly logger = new Logger(CollaborationService.name);
  private readonly pendingClaims: Map<number, PendingClaim> = new Map();

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
    const { roomId, roomCode, ptId } = client.data;

    // 호스트 권한 요청 중인 요청자가 disconnect되면 요청 취소
    if (roomId && ptId) {
      const pendingClaim = this.pendingClaims.get(roomId);
      if (pendingClaim && pendingClaim.requesterId === ptId) {
        clearTimeout(pendingClaim.timeoutId);
        this.pendingClaims.delete(roomId);

        // 호스트에게 요청 취소 알림
        const hostSocket = await this.findHostSocket(server, roomCode);
        if (hostSocket) {
          hostSocket.emit(SOCKET_EVENTS.HOST_CLAIM_CANCELLED, {});
        }

        this.logger.log(
          `[DISCONNECT] Host claim cancelled: requester ${ptId} disconnected from room ${roomCode}`,
        );
      }
    }

    await this.ptService.handleDisconnect(client, server);
  }

  /** 방 입장: 참가자 생성/복원, 소켓 룸 참여, 초기 데이터 전송 */
  async handleJoinRoom(
    client: CollabSocket,
    server: Server,
    payload: JoinRoomPayload,
    token: string | null,
  ): Promise<void> {
    const { roomCode: rawRoomCode } = payload;
    const roomCode = rawRoomCode.toUpperCase();

    // 방 존재 확인
    const room = await this.roomService.findRoomByCode(roomCode);
    if (!room) throw new Error(ERROR_CODE.ROOM_NOT_FOUND);

    // ============================================================
    // 쿠키(토큰)가 있다 -> 복원 시도
    // ============================================================
    if (token) {
      try {
        const decoded = this.roomTokenService.verify(token);

        if (decoded && decoded.roomCode.toUpperCase() === roomCode) {
          const pt = await this.ptService.restorePt(room.roomId, decoded.ptId);

          if (pt) {
            await this.completeJoinRoom(client, server, room, pt);
            return;
          }
        }
      } catch (e) {
        this.logger.warn(`Token verification failed: ${e.message}`);
      }
    }

    // ============================================================
    // 토큰 없음 -> 에러 -> HTTP join 유도
    // ============================================================
    if (room.roomPassword) {
      throw new Error(ERROR_CODE.PASSWORD_REQUIRED);
    } else {
      throw new Error(ERROR_CODE.NICKNAME_REQUIRED);
    }
  }

  /**
   * 입장 완료 처리
   */
  private async completeJoinRoom(
    client: CollabSocket,
    server: Server,
    room: Room,
    pt: Pt,
  ) {
    const doc = await this.documentService.getDocByRoomId(room.roomId);
    if (!doc) throw new Error('DOCUMENT_NOT_FOUND');

    // 소켓 데이터 세팅
    this.setupSocketData(client, room, pt, doc);

    // 실제 소켓 룸 조인
    await client.join(room.roomCode);

    // Yjs 동기화
    await this.fileService.prepareDoc(client, server);

    // 알림 전송
    await this.notifyParticipantJoined(client, server, pt, room);

    this.logger.log(
      `[JOIN_ROOM] ${pt.nickname}(${pt.ptId}) restored/joined ${room.roomCode}`,
    );
  }

  /** 방 나가기 */
  async handleLeftRoom(client: CollabSocket, server: Server): Promise<void> {
    const { roomId, roomCode, ptId, role } = client.data;
    if (!roomId || !roomCode || !ptId) return;

    // 호스트 권한 요청 중인 요청자가 퇴장하면 요청 취소
    const pendingClaim = this.pendingClaims.get(roomId);
    if (pendingClaim && pendingClaim.requesterId === ptId) {
      clearTimeout(pendingClaim.timeoutId);
      this.pendingClaims.delete(roomId);

      // 호스트에게 요청 취소 알림
      const hostSocket = await this.findHostSocket(server, roomCode);
      if (hostSocket) {
        hostSocket.emit(SOCKET_EVENTS.HOST_CLAIM_CANCELLED, {});
      }

      this.logger.log(
        `[LEFT_ROOM] Host claim cancelled: requester ${ptId} left room ${roomCode}`,
      );
    }

    // 참가자 삭제 및 다른 참가자들에게 알림

    await this.ptService.deletePt(roomId, ptId);

    client.emit(SOCKET_EVENTS.GOODBYE);
    server.to(roomCode).emit(SOCKET_EVENTS.PT_LEFT, { ptId });

    await client.leave(roomCode);

    this.logger.log(`[LEFT_ROOM] ptId: ${ptId} left room ${roomCode}`);

    // Host가 나갔다면 다른 참가자에게 호스트 권한 양도
    if (role === ROLE.HOST) {
      await this.handleAutoTransferHost(client, server);
    }

    // 참가자가 없으면 방 폭파
    const hasParticipants = await this.ptService.hasParticipants(roomId);
    if (!hasParticipants) {
      await this.handleDestroyRoom(client, server);
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

    if (client.data.role === ROLE.HOST) {
      if (!UPDATABLE_PT_ROLES.includes(role)) {
        client.emit('error', {
          type: ERROR_CODE.INVALID_INPUT,
          message: '호스트 권한은 양도를 통해서만 변경할 수 있습니다',
        });
        return;
      }

      await this.ptService.updatePt(client, server, ptId, { role });

      const pt = await this.ptService.getPt(roomId, ptId);
      if (!pt) return;

      this.notifyUpdatePt(client, server, pt);
    }
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
    const currentExts = [...EXT_TYPES, 'htm'];
    const extResult = {
      error: true,
      type: FILENAME_CHECK_RESULT_TYPES[0], // 'ext'
      message: '유효하지 않는 확장자입니다.',
    } as FilenameCheckResultPayload;

    const { filename } = payload;
    const { roomId, docId } = client.data;

    const room = await this.roomService.findRoomById(roomId);

    if (!room) {
      return {
        error: true,
        type: FILENAME_CHECK_RESULT_TYPES[2], // 'no_room'
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
        type: FILENAME_CHECK_RESULT_TYPES[1], // 'duplicate'
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
    client.data.roomType = room.roomType;
    client.data.docId = doc.docId;
    client.data.ptId = pt.ptId;
    client.data.role = pt.role;
    client.data.nickname = pt.nickname;
    client.data.color = pt.color;
    client.data.createdAt = pt.createdAt;
  }

  /** 참가자 입장 알림 및 참가자 데이터 전송 */
  private async notifyParticipantJoined(
    client: CollabSocket,
    server: Server,
    pt: Pt,
    room: Room,
  ): Promise<void> {
    const { roomId, roomCode } = client.data;

    // 본인에게: 내 ptId 및 토큰 전달
    client.emit(SOCKET_EVENTS.WELCOME, {
      myPtId: pt.ptId,
      roomType: room.roomType,
      whoCanDestroyRoom: room.whoCanDestroyRoom,
      hasHostPassword: !!room.hostPassword,
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
   * 호스트 자동 양도
   * - 호스트가 퇴장할 때 남은 참가자 중 한 명에게 권한 양도
   * - 1순위: 가장 먼저 입장한 EDITOR
   * - 2순위: EDITOR 없으면 가장 먼저 입장한 VIEWER
   */
  async handleAutoTransferHost(
    client: CollabSocket,
    server: Server,
  ): Promise<void> {
    const { roomId, roomCode } = client.data;

    // 1. 새 호스트 후보 찾기
    const nextHost = await this.ptService.findNextHost(roomId);
    if (!nextHost) {
      this.logger.log(
        `[AUTO_TRANSFER] No candidate for host in room ${roomCode}`,
      );
      return;
    }

    // 2. 새 호스트로 역할 변경
    await this.ptService.updatePt(client, server, nextHost.ptId, {
      role: ROLE.HOST,
    });

    // 3. 변경된 참가자 정보 브로드캐스트
    const updatedPt = await this.ptService.getPt(roomId, nextHost.ptId);
    if (updatedPt) {
      server.to(roomCode).emit(SOCKET_EVENTS.UPDATE_PT, { pt: updatedPt });
    }

    // 4. 호스트 변경 알림 전송
    server.to(roomCode).emit(SOCKET_EVENTS.HOST_TRANSFERRED, {
      newHostPtId: nextHost.ptId,
    });

    this.logger.log(
      `[AUTO_TRANSFER] Host transferred to ${nextHost.ptId} in room ${roomCode}`,
    );
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

  /**
   * 호스트 권한 요청 처리
   * - hostPassword 검증
   * - 동시 요청 체크
   * - 10초 타임아웃 설정
   * - 호스트에게 요청 알림
   */
  async handleClaimHost(
    client: CollabSocket,
    server: Server,
    payload: ClaimHostPayload,
  ): Promise<void> {
    const { roomId, roomCode, ptId, role, nickname } = client.data;
    const { hostPassword } = payload;

    // 방 정보 조회
    const room = await this.roomService.findRoomById(roomId);
    if (!room) {
      client.emit(SOCKET_EVENTS.HOST_CLAIM_FAILED, {
        reason: ERROR_CODE.ROOM_NOT_FOUND,
      });
      return;
    }

    // hostPassword 검증
    if (room.hostPassword !== hostPassword) {
      client.emit(SOCKET_EVENTS.HOST_CLAIM_FAILED, {
        reason: ERROR_CODE.INVALID_PASSWORD,
      });
      return;
    }

    // 동시 요청 체크
    if (this.pendingClaims.has(roomId)) {
      client.emit(SOCKET_EVENTS.HOST_CLAIM_FAILED, {
        reason: ERROR_CODE.CLAIM_ALREADY_PENDING,
      });
      return;
    }

    // 호스트 소켓 찾기
    const hostSocket = await this.findHostSocket(server, roomCode);
    if (!hostSocket) {
      client.emit(SOCKET_EVENTS.HOST_CLAIM_FAILED, {
        reason: ERROR_CODE.HOST_NOT_FOUND,
      });
      return;
    }

    // 타임아웃 설정 (10초)
    const timeoutId = setTimeout(() => {
      void this.handleClaimTimeout(server, roomId);
    }, 10000);

    // pendingClaims에 저장
    this.pendingClaims.set(roomId, {
      requesterId: ptId,
      requesterSocketId: client.id,
      requesterRole: role,
      timeoutId,
    });

    // 호스트에게 요청 알림
    hostSocket.emit(SOCKET_EVENTS.HOST_CLAIM_REQUEST, {
      requesterPtId: ptId,
      requesterNickname: nickname || '익명',
    });

    this.logger.log(
      `[CLAIM_HOST] ${ptId} requested host claim in room ${roomCode}`,
    );
  }

  /**
   * 호스트 권한 요청 수락
   * - 기존 호스트 → 요청자의 원래 role
   * - 요청자 → HOST
   */
  async handleAcceptHostClaim(
    client: CollabSocket,
    server: Server,
  ): Promise<void> {
    const { roomId, roomCode, ptId } = client.data;

    const pendingClaim = this.pendingClaims.get(roomId);
    if (!pendingClaim) {
      throw new WsException('진행 중인 호스트 권한 요청이 없습니다');
    }

    // 타임아웃 해제
    clearTimeout(pendingClaim.timeoutId);
    this.pendingClaims.delete(roomId);

    const { requesterId, requesterSocketId, requesterRole } = pendingClaim;

    // 1. 기존 호스트 → 요청자의 원래 role (먼저)
    await this.ptService.updatePt(client, server, ptId, {
      role: requesterRole,
    });
    client.data.role = requesterRole;

    const oldHostPt = await this.ptService.getPt(roomId, ptId);
    if (oldHostPt) {
      server.to(roomCode).emit(SOCKET_EVENTS.UPDATE_PT, { pt: oldHostPt });
    }

    // 2. 요청자 → HOST (나중에)
    const requesterSocket = server.sockets.sockets.get(requesterSocketId);
    if (requesterSocket) {
      await this.ptService.updatePt(
        requesterSocket as CollabSocket,
        server,
        requesterId,
        { role: ROLE.HOST },
      );
      (requesterSocket as CollabSocket).data.role = ROLE.HOST;
    }

    const newHostPt = await this.ptService.getPt(roomId, requesterId);
    if (newHostPt) {
      server.to(roomCode).emit(SOCKET_EVENTS.UPDATE_PT, { pt: newHostPt });
    }

    // 3. HOST_TRANSFERRED 전송
    server.to(roomCode).emit(SOCKET_EVENTS.HOST_TRANSFERRED, {
      newHostPtId: requesterId,
    });

    this.logger.log(
      `[ACCEPT_HOST_CLAIM] Host transferred from ${ptId} to ${requesterId} in room ${roomCode}`,
    );
  }

  /**
   * 호스트 권한 요청 거절
   * - 요청자에게 거절 알림
   */
  handleRejectHostClaim(client: CollabSocket, server: Server): void {
    const { roomId, roomCode } = client.data;

    const pendingClaim = this.pendingClaims.get(roomId);
    if (!pendingClaim) {
      throw new WsException('진행 중인 호스트 권한 요청이 없습니다');
    }

    // 타임아웃 해제
    clearTimeout(pendingClaim.timeoutId);
    this.pendingClaims.delete(roomId);

    const { requesterId, requesterSocketId } = pendingClaim;

    // 요청자에게 거절 알림
    const requesterSocket = server.sockets.sockets.get(requesterSocketId);
    if (requesterSocket) {
      requesterSocket.emit(SOCKET_EVENTS.HOST_CLAIM_REJECTED, {});
    }

    this.logger.log(
      `[REJECT_HOST_CLAIM] Host claim from ${requesterId} rejected in room ${roomCode}`,
    );
  }

  /**
   * 호스트 권한 요청 타임아웃 (10초)
   * - 자동 수락 처리
   */
  private async handleClaimTimeout(
    server: Server,
    roomId: number,
  ): Promise<void> {
    const pendingClaim = this.pendingClaims.get(roomId);
    if (!pendingClaim) return;

    // 호스트 소켓 찾기
    const room = await this.roomService.findRoomById(roomId);
    if (!room) {
      this.pendingClaims.delete(roomId);
      return;
    }

    const hostSocket = await this.findHostSocket(server, room.roomCode);
    if (!hostSocket) {
      this.pendingClaims.delete(roomId);
      return;
    }

    this.logger.log(
      `[CLAIM_TIMEOUT] Auto-accepting host claim in room ${room.roomCode}`,
    );

    // 자동 수락 처리
    await this.handleAcceptHostClaim(hostSocket, server);
  }

  /**
   * 호스트 소켓 찾기
   */
  private async findHostSocket(
    server: Server,
    roomCode: string,
  ): Promise<CollabSocket | null> {
    const sockets = await server.in(roomCode).fetchSockets();
    for (const socket of sockets) {
      if ((socket as unknown as CollabSocket).data.role === ROLE.HOST) {
        return socket as unknown as CollabSocket;
      }
    }
    return null;
  }
}
