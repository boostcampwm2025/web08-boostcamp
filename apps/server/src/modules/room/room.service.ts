import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, LessThan, Repository } from 'typeorm';
import { CreateCustomRoomDto } from './dto/create-custom-room.dto';

import {
  Room,
  RoomType,
  DefaultRolePolicy,
  WhoCanDestroyRoom,
} from './room.entity';
import { customAlphabet } from 'nanoid';
import { Pt, PtRole, PtPresence } from '../pt/pt.entity';
import { Document } from '../document/document.entity';
import { FileService } from '../file/file.service';
import { PtService } from '../pt/pt.service';
import { RoomTokenService } from '../auth/room-token.service';
import { CreateRoomResponseDto } from './dto/create-room-response.dto';
import { RoomCreationOptions } from './room.interface';

/** 방의 생명 주기 관리 */

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  private readonly QUICK_ROOM_MAX_PTS = 6;

  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    private ptService: PtService,
    private roomTokenService: RoomTokenService,
    private fileService: FileService,
    private dataSource: DataSource,
  ) {}

  /**
   * 방 존재 여부 확인
   */
  async roomExists(roomCode: string): Promise<boolean> {
    const count = await this.roomRepository.count({
      where: { roomCode },
    });
    return count > 0;
  }

  async findRoomById(roomId: number): Promise<Room | null> {
    return this.roomRepository.findOne({ where: { roomId } });
  }

  /**
   * roomCode로 Room 엔티티 조회 (방 유효성 검사용)
   */
  async findRoomByCode(roomCode: string): Promise<Room | null> {
    return this.roomRepository.findOne({
      where: { roomCode: roomCode.toUpperCase() },
    });
  }

  async createQuickRoom(): Promise<CreateRoomResponseDto> {
    const options: RoomCreationOptions = {
      roomType: RoomType.QUICK,
      maxPts: this.QUICK_ROOM_MAX_PTS,
      defaultRolePolicy: DefaultRolePolicy.EDITOR,
      whoCanDestroyRoom: WhoCanDestroyRoom.EDITOR,
      roomCreatorRole: PtRole.EDITOR,
    };

    return this.createRoom(options);
  }

  async createCustomRoom(
    dto: CreateCustomRoomDto,
  ): Promise<CreateRoomResponseDto> {
    const { roomPassword, hostPassword, maxPts } = dto;

    const options: RoomCreationOptions = {
      roomType: RoomType.CUSTOM,
      roomPassword,
      hostPassword,
      maxPts,
      defaultRolePolicy: DefaultRolePolicy.VIEWER,
      whoCanDestroyRoom: WhoCanDestroyRoom.HOST,
      roomCreatorRole: PtRole.HOST,
    };

    return this.createRoom(options);
  }

  private async createRoom(
    options: RoomCreationOptions,
  ): Promise<CreateRoomResponseDto> {
    const roomCode = await this.generateUniqueRoomCode();

    const {
      roomType,
      roomPassword,
      hostPassword,
      maxPts,
      defaultRolePolicy,
      whoCanDestroyRoom,
      roomCreatorRole,
    } = options;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newRoom = queryRunner.manager.create(Room, {
        roomCode,
        roomType,
        roomPassword,
        hostPassword,
        maxPts,
        defaultRolePolicy,
        whoCanDestroyRoom,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const savedRoom = await queryRunner.manager.save(newRoom);

      const hostPt = queryRunner.manager.create(Pt, {
        room: savedRoom,
        ptHash: this.ptService.generatePtHash(),
        role: roomCreatorRole,
        nickname: 'Host',
        color: '#E0E0E0',
        presence: PtPresence.ONLINE,
      });

      const savedPt = await queryRunner.manager.save(hostPt);

      const document = queryRunner.manager.create(Document, {
        room: savedRoom,
        roomId: savedRoom.roomId,
        content: this.fileService.generateInitialSnapshot(),
      });

      await queryRunner.manager.save(document);

      await queryRunner.commitTransaction();

      const token = this.roomTokenService.sign({
        roomCode: savedRoom.roomCode,
        ptId: savedPt.ptId,
      });

      this.logger.log(
        `✅ Quick Room Created: [${savedRoom.roomCode}] (ID: ${savedRoom.roomId}), Host Pt: [${savedPt.ptId}], Doc Id: [${document.docId}]`,
      );

      return {
        roomCode: savedRoom.roomCode,
        token,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create room: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async generateUniqueRoomCode(maxRetries = 3): Promise<string> {
    for (let i = 0; i < maxRetries; i++) {
      const roomCode = this.generateRoomCode();

      const existingRoom = await this.roomRepository.findOne({
        where: { roomCode },
        select: ['roomId'],
      });

      if (!existingRoom) {
        return roomCode;
      }

      this.logger.warn(
        `Room code collision detected: ${roomCode}. Retrying... (${i + 1}/${maxRetries})`,
      );
    }

    throw new InternalServerErrorException(
      'Failed to generate unique room code',
    );
  }

  protected generateRoomCode(roomCodeLength = 6): string {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nanoid = customAlphabet(alphabet, roomCodeLength);
    return nanoid();
  }

  /**
   * Room code로 Room ID 조회
   */
  async findRoomIdByCode(roomCode: string): Promise<number | null> {
    const room = await this.roomRepository.findOne({
      where: { roomCode },
      select: ['roomId'],
    });
    return room?.roomId ?? null;
  }

  /**
   * [Scheduler용] 만료 시간이 지난 방 목록 조회
   */
  async findExpiredRooms(): Promise<Room[]> {
    const now = new Date();
    return await this.roomRepository.find({
      where: {
        expiresAt: LessThan(now),
      },
      select: ['roomId', 'roomCode'],
    });
  }

  /**
   * [Scheduler용] 방 ID 목록을 받아 일괄 삭제
   */
  async deleteRooms(roomIds: number[]): Promise<number> {
    if (roomIds.length === 0) return 0;

    const result = await this.roomRepository.delete({
      roomId: In(roomIds),
    });

    return result.affected ?? 0;
  }

  /**
   * 방 폭파 (단일 방 삭제)
   * - DB에서 방 삭제
   * - Y.Doc 메모리 해제
   */
  async destroyRoom(roomId: number, docId: string): Promise<void> {
    // 1. DB 삭제
    await this.deleteRooms([roomId]);

    // 2. Y.Doc 메모리 해제 (Redis는 TTL로 자동 만료)
    await this.fileService.removeDoc(docId);

    this.logger.log(`🔥 Room destroyed: roomId=${roomId}, docId=${docId}`);
  }
}
