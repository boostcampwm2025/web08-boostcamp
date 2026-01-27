import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, LessThan, Repository } from 'typeorm';
import { CreateCustomRoomRequestDto } from './dto/create-custom-room-request.dto';

import { Room } from './room.entity';
import {
  ROOM_TYPE,
  DEFAULT_ROLE,
  WHO_CAN_DESTROY_ROOM,
  ROLE,
  PRESENCE,
  LIMITS,
  ERROR_CODE,
  ERROR_MESSAGES,
  ROOM_CONFIG,
  DEFAULT_HOST,
} from '@codejam/common';
import { customAlphabet } from 'nanoid';
import { Pt } from '../pt/pt.entity';
import { Document } from '../document/document.entity';
import { FileService } from '../file/file.service';
import { PtService } from '../pt/pt.service';
import { RoomTokenService } from '../auth/room-token.service';
import { CreateQuickRoomResponseDto } from './dto/create-quick-room-response.dto';
import { RoomCreationOptions } from './room.interface';
import { ApiException } from '../../common/exceptions/api.exception';

/** 방의 생명 주기 관리 */

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    private ptService: PtService,
    private roomTokenService: RoomTokenService,
    private fileService: FileService,
    private dataSource: DataSource,
  ) {}

  /**
   * RoomCode 유효성 검사 및 존재 여부 확인
   */
  async roomExists(roomCode: string): Promise<boolean> {
    return await this.roomRepository.exists({ where: { roomCode } });
  }

  async findRoomById(roomId: number): Promise<Room | null> {
    return this.roomRepository.findOne({ where: { roomId } });
  }

  async findRoomByCode(roomCode: string): Promise<Room | null> {
    return this.roomRepository.findOne({
      where: { roomCode: roomCode.toUpperCase() },
    });
  }

  async findRoomIdByCode(roomCode: string): Promise<number | null> {
    const room = await this.roomRepository.findOne({
      where: { roomCode },
      select: ['roomId'],
    });
    return room?.roomId ?? null;
  }

  // --- Room Creation Methods ---

  async createQuickRoom(): Promise<CreateQuickRoomResponseDto> {
    const options: RoomCreationOptions = {
      roomType: ROOM_TYPE.QUICK,
      maxPts: ROOM_CONFIG.QUICK_ROOM_MAX_PTS,
      defaultRolePolicy: DEFAULT_ROLE[ROOM_TYPE.QUICK],
      whoCanDestroyRoom: WHO_CAN_DESTROY_ROOM[ROOM_TYPE.QUICK],
      roomCreatorRole: ROLE.EDITOR,
    };

    const { roomCode } = await this.createRoom(options);
    return { roomCode };
  }

  async createCustomRoom(dto: CreateCustomRoomRequestDto) {
    const options: RoomCreationOptions = {
      roomType: ROOM_TYPE.CUSTOM,
      roomPassword: dto.roomPassword,
      hostPassword: dto.hostPassword,
      maxPts: dto.maxPts,
      defaultRolePolicy: DEFAULT_ROLE[ROOM_TYPE.CUSTOM],
      whoCanDestroyRoom: WHO_CAN_DESTROY_ROOM[ROOM_TYPE.CUSTOM],
      roomCreatorRole: ROLE.HOST,
    };

    const { roomCode, token } = await this.createRoom(options);

    if (!token) {
      this.logger.error(
        `Failed to generate token for Custom Room: ${roomCode}`,
      );
      throw new InternalServerErrorException('Token generation failed');
    }

    return { roomCode, token };
  }

  /**
   * 방 생성 (Transaction)
   */
  private async createRoom(
    options: RoomCreationOptions,
  ): Promise<{ roomCode: string; token?: string }> {
    const roomCode = await this.generateUniqueRoomCode();

    return await this.dataSource.transaction(async (manager: EntityManager) => {
      try {
        // 1. Room 생성
        const newRoom = manager.create(Room, {
          roomCode,
          roomType: options.roomType,
          roomPassword: options.roomPassword,
          hostPassword: options.hostPassword,
          maxPts: options.maxPts,
          defaultRolePolicy: options.defaultRolePolicy,
          whoCanDestroyRoom: options.whoCanDestroyRoom,
          expiresAt: new Date(Date.now() + ROOM_CONFIG.EXPIRATION_MS),
        });
        const savedRoom = await manager.save(newRoom);

        // 2. Host Pt 생성 및 토큰 발급 (Quick Room 제외)
        let token: string | undefined;
        if (options.roomType !== ROOM_TYPE.QUICK) {
          const hostPt = manager.create(Pt, {
            room: savedRoom,
            ptHash: this.ptService.generatePtHash(),
            role: options.roomCreatorRole,
            nickname: DEFAULT_HOST.NICKNAME,
            color: DEFAULT_HOST.COLOR,
            presence: PRESENCE.ONLINE,
          });
          const savedPt = await manager.save(hostPt);

          token = this.roomTokenService.sign({
            roomCode: savedRoom.roomCode,
            ptId: savedPt.ptId,
          });
        }

        // 3. Document 초기 스냅샷 생성
        const document = manager.create(Document, {
          room: savedRoom,
          roomId: savedRoom.roomId,
          content: this.fileService.generateInitialSnapshot(),
        });
        await manager.save(document);

        this.logger.log(
          `✅ Room Created: [${savedRoom.roomCode}] Type: ${options.roomType}, ID: ${savedRoom.roomId}`,
        );

        return { roomCode: savedRoom.roomCode, token };
      } catch (error) {
        this.logger.error(
          `Failed to create room (${options.roomType}): ${error.message}`,
          error.stack,
        );
        throw error;
      }
    });
  }

  // --- Helper Methods ---

  private async generateUniqueRoomCode(maxRetries = 3): Promise<string> {
    for (let i = 0; i < maxRetries; i++) {
      const roomCode = this.generateRoomCode();
      const exists = await this.roomExists(roomCode);

      if (!exists) return roomCode;

      this.logger.warn(
        `Collision detected for RoomCode: ${roomCode}. Retrying (${i + 1}/${maxRetries})...`,
      );
    }

    throw new InternalServerErrorException(
      'Unable to generate a unique room code after multiple attempts.',
    );
  }

  protected generateRoomCode(roomCodeLength = LIMITS.ROOM_CODE_LENGTH): string {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nanoid = customAlphabet(alphabet, roomCodeLength);
    return nanoid();
  }

  // --- Room Maintenance Methods ---

  async findExpiredRooms(): Promise<Room[]> {
    return await this.roomRepository.find({
      where: { expiresAt: LessThan(new Date()) },
      select: ['roomId', 'roomCode'],
    });
  }

  async deleteRooms(roomIds: number[]): Promise<number> {
    if (roomIds.length === 0) return 0;
    const result = await this.roomRepository.delete({ roomId: In(roomIds) });
    return result.affected ?? 0;
  }

  async destroyRoom(roomId: number, docId: string): Promise<void> {
    try {
      await this.deleteRooms([roomId]);
      await this.fileService.removeDoc(docId);
      this.logger.log(`🔥 Room destroyed: roomId=${roomId}, docId=${docId}`);
    } catch (error) {
      this.logger.error(`Failed to destroy room ${roomId}: ${error.message}`);
      throw error;
    }
  }

  // --- Join & Auth Methods ---

  /**
   * [HTTP 전용] 방 입장 처리 (Pt 생성 & Token 발행)
   * 1. 방 비밀번호 검증
   * 2. 정원 초과 확인
   * 3. 참가자(Pt) DB 생성
   * 4. 토큰(JWT) 발급
   */
  async joinRoom(
    roomCode: string,
    nickname: string,
    password?: string,
  ): Promise<{ token: string; ptId: string }> {
    // 1. 방 조회
    const room = await this.findRoomByCode(roomCode);
    if (!room) {
      throw new ApiException(
        ERROR_CODE.ROOM_NOT_FOUND,
        ERROR_MESSAGES.ROOM_NOT_FOUND,
        404,
      );
    }

    // 2. 비밀번호 검증
    this.validatePassword(room, password);

    // 3. 정원 체크
    const currentCount = await this.ptService.roomCounter(room.roomId);
    if (currentCount >= room.maxPts) {
      throw new ApiException(
        ERROR_CODE.ROOM_FULL,
        '방의 정원이 초과되었습니다.',
        409,
      );
    }

    // 4. 참가자(Pt) 생성
    const newPt = await this.ptService.createPt(room.roomId, nickname);

    // 5. 토큰 발급
    const token = this.roomTokenService.sign({
      roomCode: room.roomCode,
      ptId: newPt.ptId,
    });

    this.logger.log(`[HTTP_JOIN] New pt created: ${newPt.ptId} in ${roomCode}`);

    return { token, ptId: newPt.ptId };
  }

  async verifyRoomPassword(roomCode: string, password?: string): Promise<void> {
    const room = await this.findRoomByCode(roomCode);
    if (!room) {
      throw new ApiException(
        ERROR_CODE.ROOM_NOT_FOUND,
        '방을 찾을 수 없습니다.',
        404,
      );
    }

    this.validatePassword(room, password);
  }

  private validatePassword(room: Room, password?: string): void {
    if (room.roomPassword) {
      if (!password) {
        throw new ApiException(
          ERROR_CODE.PASSWORD_REQUIRED,
          '비밀번호를 입력해주세요.',
          401,
        );
      }
      if (room.roomPassword !== password) {
        throw new ApiException(
          ERROR_CODE.PASSWORD_UNCORRECT,
          '비밀번호가 일치하지 않습니다.',
          401,
        );
      }
    }
  }
}
