import {
  Pt,
  SOCKET_EVENTS,
  PtUpdatePayload,
  PT_COLORS,
  ROLE,
  PRESENCE,
  LIMITS,
  type PtRole,
  type PtPresence,
} from '@codejam/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { customAlphabet } from 'nanoid';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { CollabSocket } from '../collaboration/collaboration.types';
import { Pt as PtEntity } from './pt.entity';
import { Room } from '../room/room.entity';

@Injectable()
export class PtService {
  private readonly logger = new Logger(PtService.name);

  constructor(
    @InjectRepository(PtEntity)
    private ptRepository: Repository<PtEntity>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  private readonly colors = PT_COLORS;

  /** 클라이언트 연결 시 로깅 */
  handleConnection(client: CollabSocket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /** 클라이언트 연결 종료 처리 */
  async handleDisconnect(client: CollabSocket, server: Server) {
    const { roomId, ptId, role } = client.data;

    this.logger.log(`Client disconnected: ${ptId} from room ${roomId}`);

    await this.updatePtPresence(roomId, ptId, PRESENCE.OFFLINE);
    this.notifyPtDisconnect(client, server);

    // EDITOR가 나가고 방 정책이 자동 승격을 허용하는 경우에만 승격 시도
    if (role === ROLE.EDITOR && (await this.shouldAutoPromote(roomId))) {
      await this.promoteCandidates(client, server);
    }
  }

  /** 새 참가자 생성 */
  async createPt(roomId: number, nickname: string): Promise<Pt> {
    const ptId = uuidv4();
    const color = await this.generateRandomColor(roomId);
    const role = await this.assignRole(roomId);
    const ptHash = this.generatePtHash();

    const ptEntity = this.ptRepository.create({
      ptId,
      roomId,
      ptHash,
      nickname,
      color,
      role,
      presence: PRESENCE.ONLINE,
    });

    await this.ptRepository.save(ptEntity);

    return this.entityToPt(ptEntity);
  }

  /** 특정 참가자 조회 */
  async getPt(roomId: number, ptId: string): Promise<Pt | null> {
    const ptEntity = await this.ptRepository.findOne({
      where: { roomId, ptId },
    });

    if (!ptEntity) return null;
    return this.entityToPt(ptEntity);
  }

  /** 참가자 삭제 */
  async deletePt(roomId: number, ptId: string): Promise<void> {
    await this.ptRepository.delete({ roomId, ptId });
    this.logger.log(`[DELETE_PT] ptId: ${ptId} from room ${roomId}`);
  }

  /** 참가자 복원: ptId로 DB에서 조회하고 presence를 ONLINE으로 업데이트 */
  async restorePt(roomId: number, ptId: string): Promise<Pt | null> {
    const ptEntity = await this.ptRepository.findOne({
      where: { roomId, ptId },
    });

    if (!ptEntity) return null;

    // presence를 ONLINE으로 업데이트
    await this.ptRepository.update(
      { roomId, ptId },
      { presence: PRESENCE.ONLINE },
    );

    ptEntity.presence = PRESENCE.ONLINE;
    return this.entityToPt(ptEntity);
  }

  /** 방의 모든 참가자 조회 */
  async getAllPts(roomId: number): Promise<Pt[]> {
    const ptEntities = await this.ptRepository.find({
      where: { room: { roomId } },
      order: { createdAt: 'ASC' },
    });

    return ptEntities.map((pt) => this.entityToPt(pt));
  }

  /** 방에 참가자가 존재하는지 확인 */
  async hasParticipants(roomId: number): Promise<boolean> {
    const pt = await this.ptRepository.findOne({ where: { roomId } });
    return pt !== null;
  }

  /** 참가자 권한 조회 */
  async checkRole(roomId: number, ptId: string): Promise<PtRole | undefined> {
    const pt = await this.ptRepository.findOne({
      where: { roomId, ptId },
    });

    if (!pt) {
      return undefined;
    }

    return pt.role;
  }

  /** 역할 할당: 방 정책에 따라 EDITOR 또는 VIEWER 할당 */
  async assignRole(roomId: number): Promise<PtRole> {
    const room = await this.roomRepository.findOne({ where: { roomId } });
    if (!room) return ROLE.VIEWER;

    // VIEWER 정책: 무조건 VIEWER
    if (room.defaultRolePolicy === ROLE.VIEWER) {
      return ROLE.VIEWER;
    }

    // EDITOR 정책: 선착순 6명까지 EDITOR
    const editorCount = await this.countEditors(roomId);

    if (editorCount < LIMITS.MAX_CAN_EDIT) {
      return ROLE.EDITOR;
    }

    return ROLE.VIEWER;
  }

  /** 참가자 업데이트 (소켓 + DB) */
  async updatePt(
    client: CollabSocket,
    server: Server,
    ptId: string,
    option: { role?: PtRole; nickname?: string },
  ): Promise<void> {
    const { roomId, roomCode } = client.data;
    const { role, nickname } = option;

    // DB에서 현재 참가자 정보 조회
    const currentPt = await this.ptRepository.findOne({
      where: { roomId, ptId },
    });
    if (!currentPt) return;

    // 업데이트할 값 결정
    const updatedRole = role ?? currentPt.role;
    const updatedNickname = nickname ?? currentPt.nickname;

    // DB 업데이트 (소켓 연결 여부와 관계없이)
    await this.ptRepository.update(
      { roomId, ptId },
      { role: updatedRole, nickname: updatedNickname },
    );

    // 소켓이 연결되어 있다면 소켓 데이터도 업데이트
    const sockets = await server.in(roomCode).fetchSockets();
    const socketToUpdate = sockets.find((socket) => {
      const data = socket.data as CollabSocket['data'];
      return data.ptId === ptId;
    });

    if (socketToUpdate) {
      const data = socketToUpdate.data as CollabSocket['data'];
      data.role = updatedRole;
      data.nickname = updatedNickname;
    }
  }

  /** 현재 방에 있는 인원 수 */
  async roomCounter(roomId: number): Promise<number> {
    return await this.ptRepository.count({ where: { roomId } });
  }

  /** 참가자 상태 업데이트 */
  private async updatePtPresence(
    roomId: number,
    ptId: string,
    presence: PtPresence,
  ): Promise<void> {
    await this.ptRepository.update({ roomId, ptId }, { presence });
  }

  /** 참가자 연결 끊김 알림 */
  private notifyPtDisconnect(client: CollabSocket, server: Server): void {
    const { roomCode, ptId } = client.data;
    server.to(roomCode).emit(SOCKET_EVENTS.PT_DISCONNECT, { ptId });
  }

  /** 방 정책이 자동 승격을 허용하는지 확인 */
  private async shouldAutoPromote(roomId: number): Promise<boolean> {
    const room = await this.roomRepository.findOne({ where: { roomId } });
    if (!room) return false;

    // EDITOR 정책인 경우에만 자동 승격 허용
    return room.defaultRolePolicy === ROLE.EDITOR;
  }

  /** Viewer를 Editor로 승격 */
  private async promoteCandidates(
    client: CollabSocket,
    server: Server,
  ): Promise<void> {
    const { roomId } = client.data;
    const oldestViewer = await this.findOldestViewer(roomId);
    if (!oldestViewer) return;

    const { ptId: targetPtId } = oldestViewer;

    await this.updatePt(client, server, targetPtId, { role: ROLE.EDITOR });
    await this.notifyPtRoleUpdate(client, server, targetPtId);

    this.logger.log(`[PROMOTE] ${targetPtId} → EDITOR in room ${roomId}`);
  }

  /** 가장 먼저 들어온 VIEWER 조회 */
  private async findOldestViewer(roomId: number): Promise<PtEntity | null> {
    return this.ptRepository.findOne({
      where: {
        roomId,
        role: ROLE.VIEWER,
        presence: PRESENCE.ONLINE,
      },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * 호스트 양도 대상 찾기
   * 1순위: 가장 먼저 들어온 EDITOR (온라인)
   * 2순위: 가장 먼저 들어온 VIEWER (온라인)
   */
  async findNextHost(roomId: number): Promise<PtEntity | null> {
    // 1순위: 가장 먼저 들어온 EDITOR
    const editor = await this.ptRepository.findOne({
      where: {
        roomId,
        role: ROLE.EDITOR,
        presence: PRESENCE.ONLINE,
      },
      order: { createdAt: 'ASC' },
    });
    if (editor) return editor;

    // 2순위: 가장 먼저 들어온 VIEWER
    return this.ptRepository.findOne({
      where: {
        roomId,
        role: ROLE.VIEWER,
        presence: PRESENCE.ONLINE,
      },
      order: { createdAt: 'ASC' },
    });
  }

  /** 참가자 역할 변경 알림 */
  private async notifyPtRoleUpdate(
    client: CollabSocket,
    server: Server,
    ptId: string,
  ): Promise<void> {
    const { roomId, roomCode } = client.data;
    const updatedPt = await this.getPt(roomId, ptId);
    const updatePayload: PtUpdatePayload = { pt: updatedPt! };

    server.to(roomCode).emit(SOCKET_EVENTS.UPDATE_PT, updatePayload);
  }

  /** 참가자 해시 생성 (숫자 4자리) */
  public generatePtHash(): string {
    const nanoid = customAlphabet('0123456789', LIMITS.PT_HASH_LENGTH);
    return nanoid();
  }

  /** EDITOR 역할을 가진 참가자 수 조회 */
  private async countEditors(roomId: number): Promise<number> {
    return this.ptRepository.count({
      where: { roomId, role: ROLE.EDITOR },
    });
  }

  /** 랜덤 닉네임 생성 */
  private generateRandomNickname(length: number = 10): string {
    return randomBytes(length * 2)
      .toString('base64')
      .replace(/[^a-z0-9]/gi, '')
      .toLowerCase()
      .substring(0, length);
  }

  /** 랜덤 색상 생성 (최근 6명과 중복되지 않도록) */
  private async generateRandomColor(roomId: number): Promise<string> {
    // DB에서 직접 조회 (새 참가자 생성 시점에는 server가 없으므로)
    const ptEntities = await this.ptRepository.find({
      where: { roomId },
      order: { createdAt: 'DESC' },
      take: 6,
    });
    const ptColors = ptEntities.map((entity) => entity.color);
    const availableColors = this.colors.filter(
      (color) => !ptColors.includes(color),
    );

    const colors = availableColors.length > 0 ? availableColors : this.colors;
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /** PtEntity를 Pt (common 타입)으로 변환 */
  private entityToPt(entity: PtEntity): Pt {
    return {
      ptId: entity.ptId,
      nickname: entity.nickname,
      ptHash: entity.ptHash,
      color: entity.color as Pt['color'],
      role: entity.role,
      presence: entity.presence,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
