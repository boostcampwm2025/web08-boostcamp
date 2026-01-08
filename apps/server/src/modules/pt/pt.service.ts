import { Pt, SOCKET_EVENTS, PtUpdatePayload } from '@codejam/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { customAlphabet } from 'nanoid';
import { Server } from 'socket.io';
import { CollabSocket } from '../collaboration/collaboration.types';
import { Pt as PtEntity, PtRole, PtPresence } from './pt.entity';
import { Room, DefaultRolePolicy } from '../room/room.entity';
import { MAX_EDITOR_COUNT, PT_HASH_LENGTH } from './pt.constants';

@Injectable()
export class PtService {
  private readonly logger = new Logger(PtService.name);

  constructor(
    @InjectRepository(PtEntity)
    private ptRepository: Repository<PtEntity>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  private readonly colors = [
    '#ef4444',
    '#22c55e',
    '#3b82f6',
    '#eab308',
    '#a855f7',
    '#ec4899',
  ];

  /** 클라이언트 연결 시 로깅 */
  handleConnection(client: CollabSocket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /** 클라이언트 연결 종료 처리 */
  async handleDisconnect(
    server: Server,
    roomCode: string,
    ptId: string,
    role: PtRole,
  ) {
    this.logger.log(`Client disconnected: ${ptId} from room ${roomCode}`);

    await this.updatePtPresence(roomCode, ptId, PtPresence.OFFLINE);
    this.notifyPtDisconnect(server, roomCode, ptId);

    // EDITOR가 나가고 방 정책이 자동 승격을 허용하는 경우에만 승격 시도
    if (role === PtRole.EDITOR && (await this.shouldAutoPromote(roomCode))) {
      await this.promoteCandidates(server, roomCode);
    }
  }

  /** 새 참가자 생성 */
  async createPt(roomCode: string, ptId: string): Promise<Pt> {
    const nickname = this.generateRandomNickname();
    const color = await this.generateRandomColor(roomCode);
    const role = await this.assignRole(roomCode);
    const ptHash = this.generatePtHash();

    const ptEntity = this.ptRepository.create({
      ptId,
      roomCode,
      ptHash,
      nickname,
      color,
      role,
      presence: PtPresence.ONLINE,
    });

    await this.ptRepository.save(ptEntity);

    return this.entityToPt(ptEntity);
  }

  /** 특정 참가자 조회 */
  async getPt(roomCode: string, ptId: string): Promise<Pt | null> {
    const ptEntity = await this.ptRepository.findOne({
      where: { roomCode, ptId },
    });

    if (!ptEntity) return null;
    return this.entityToPt(ptEntity);
  }

  /** 방의 모든 참가자 조회 */
  async getAllPts(roomCode: string): Promise<Pt[]> {
    const ptEntities = await this.ptRepository.find({
      where: { roomCode },
      order: { createdAt: 'ASC' },
    });

    return ptEntities.map((pt) => this.entityToPt(pt));
  }

  /** 참가자 권한 조회 */
  async checkRole(roomCode: string, ptId: string): Promise<PtRole | undefined> {
    const pt = await this.ptRepository.findOne({
      where: { roomCode, ptId },
    });

    if (!pt) {
      return undefined;
    }

    return pt.role;
  }

  /** 역할 할당: 방 정책에 따라 EDITOR 또는 VIEWER 할당 */
  async assignRole(roomCode: string): Promise<PtRole> {
    const room = await this.roomRepository.findOne({
      where: { roomCode },
    });

    if (!room) return PtRole.VIEWER;

    // VIEWER 정책: 무조건 VIEWER
    if (room.defaultRolePolicy === DefaultRolePolicy.VIEWER) {
      return PtRole.VIEWER;
    }

    // EDITOR 정책: 선착순 6명까지 EDITOR
    const editorCount = await this.countEditors(roomCode);

    if (editorCount < MAX_EDITOR_COUNT) {
      return PtRole.EDITOR;
    }

    return PtRole.VIEWER;
  }

  /** 참가자 역할 업데이트 (소켓 + DB) */
  async updatePtRole(
    server: Server,
    roomCode: string,
    ptId: string,
    role: PtRole,
  ): Promise<void> {
    // 소켓 데이터 업데이트
    const sockets = await server.in(roomCode).fetchSockets();
    const socketToUpdate = sockets.find((socket) => {
      const data = socket.data as CollabSocket['data'];
      return data.ptId === ptId;
    });

    if (socketToUpdate) {
      const data = socketToUpdate.data as CollabSocket['data'];
      data.role = role;
    }

    // DB 업데이트
    await this.ptRepository.update({ roomCode, ptId }, { role });
  }

  /** 참가자 상태 업데이트 */
  private async updatePtPresence(
    roomCode: string,
    ptId: string,
    presence: PtPresence,
  ): Promise<void> {
    await this.ptRepository.update({ roomCode, ptId }, { presence });
  }

  /** 참가자 연결 끊김 알림 */
  private notifyPtDisconnect(
    server: Server,
    roomCode: string,
    ptId: string,
  ): void {
    server.to(roomCode).emit(SOCKET_EVENTS.PT_DISCONNECT, { ptId });
  }

  /** 방 정책이 자동 승격을 허용하는지 확인 */
  private async shouldAutoPromote(roomCode: string): Promise<boolean> {
    const room = await this.roomRepository.findOne({
      where: { roomCode },
    });

    if (!room) return false;

    // EDITOR 정책인 경우에만 자동 승격 허용
    return room.defaultRolePolicy === DefaultRolePolicy.EDITOR;
  }

  /** Viewer를 Editor로 승격 */
  private async promoteCandidates(
    server: Server,
    roomCode: string,
  ): Promise<void> {
    const oldestViewer = await this.findOldestViewer(roomCode);
    if (!oldestViewer) return;

    const { ptId } = oldestViewer;

    await this.updatePtRole(server, roomCode, ptId, PtRole.EDITOR);
    await this.notifyPtRoleUpdate(server, roomCode, ptId);

    this.logger.log(`[PROMOTE] ${ptId} → EDITOR in room ${roomCode}`);
  }

  /** 가장 먼저 들어온 VIEWER 조회 */
  private async findOldestViewer(roomCode: string): Promise<PtEntity | null> {
    return this.ptRepository.findOne({
      where: {
        roomCode,
        role: PtRole.VIEWER,
        presence: PtPresence.ONLINE,
      },
      order: { createdAt: 'ASC' },
    });
  }

  /** 참가자 역할 변경 알림 */
  private async notifyPtRoleUpdate(
    server: Server,
    roomCode: string,
    ptId: string,
  ): Promise<void> {
    const updatedPt = await this.getPt(roomCode, ptId);
    const updatePayload: PtUpdatePayload = {
      pt: updatedPt!,
    };
    server.to(roomCode).emit(SOCKET_EVENTS.UPDATE_PT, updatePayload);
  }

  /** 참가자 해시 생성 (숫자 4자리) */
  public generatePtHash(): string {
    const nanoid = customAlphabet('0123456789', PT_HASH_LENGTH);
    return nanoid();
  }

  /** EDITOR 역할을 가진 참가자 수 조회 */
  private async countEditors(roomCode: string): Promise<number> {
    return this.ptRepository.count({
      where: {
        roomCode,
        role: PtRole.EDITOR,
      },
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
  private async generateRandomColor(roomCode: string): Promise<string> {
    const pts = await this.getAllPts(roomCode);
    const numColors = 6;
    const ptColors = pts.slice(-numColors).map((pt) => pt.color);
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
      color: entity.color,
      role: entity.role,
      presence: entity.presence,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
