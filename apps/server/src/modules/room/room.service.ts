import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, LessThan, Repository } from 'typeorm';
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
} from '@codejam/common';
import { customAlphabet } from 'nanoid';
import { Pt } from '../pt/pt.entity';
import { Document } from '../document/document.entity';
import { FileService } from '../file/file.service';
import { PtService } from '../pt/pt.service';
import { RoomTokenService } from '../auth/room-token.service';
import { CreateQuickRoomResponseDto } from './dto/create-quick-room-response.dto';
import { CreateCustomRoomResponseDto } from './dto/create-custom-room-response.dto';
import { RoomCreationOptions } from './room.interface';
import { ApiException } from 'src/common/exceptions/api.exception';

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

  async createQuickRoom(): Promise<CreateQuickRoomResponseDto> {
    const options: RoomCreationOptions = {
      roomType: ROOM_TYPE.QUICK,
      maxPts: this.QUICK_ROOM_MAX_PTS,
      defaultRolePolicy: DEFAULT_ROLE[ROOM_TYPE.QUICK],
      whoCanDestroyRoom: WHO_CAN_DESTROY_ROOM[ROOM_TYPE.QUICK],
      roomCreatorRole: ROLE.EDITOR,
    };

    const result = await this.createRoom(options);
    // Quick room은 token이 없으므로 제거
    return { roomCode: result.roomCode };
  }

  async createCustomRoom(
    dto: CreateCustomRoomRequestDto,
  ): Promise<CreateCustomRoomResponseDto> {
    const { roomPassword, hostPassword, maxPts } = dto;

    const options: RoomCreationOptions = {
      roomType: ROOM_TYPE.CUSTOM,
      roomPassword,
      hostPassword,
      maxPts,
      defaultRolePolicy: DEFAULT_ROLE[ROOM_TYPE.CUSTOM],
      whoCanDestroyRoom: WHO_CAN_DESTROY_ROOM[ROOM_TYPE.CUSTOM],
      roomCreatorRole: ROLE.HOST,
    };

    const result = await this.createRoom(options);
    // Custom room은 token이 필수
    if (!result.token) {
      throw new InternalServerErrorException(
        'Token is required for custom room',
      );
    }
    return { roomCode: result.roomCode, token: result.token };
  }

  private async createRoom(
    options: RoomCreationOptions,
  ): Promise<{ roomCode: string; token?: string }> {
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
      const token = await (async () => {
        if (roomType === ROOM_TYPE.QUICK) return undefined;
        const hostPt = queryRunner.manager.create(Pt, {
          room: savedRoom,
          ptHash: this.ptService.generatePtHash(),
          role: roomCreatorRole,
          nickname: 'Host',
          color: '#E0E0E0',
          presence: PRESENCE.ONLINE,
        });

        const savedPt = await queryRunner.manager.save(hostPt);

        const token = this.roomTokenService.sign({
          roomCode: savedRoom.roomCode,
          ptId: savedPt.ptId,
        });

        return token;
      })();

      const document = queryRunner.manager.create(Document, {
        room: savedRoom,
        roomId: savedRoom.roomId,
        content: this.fileService.generateInitialSnapshot(),
      });

      await queryRunner.manager.save(document);

      await queryRunner.commitTransaction();

      this.logger.log(
        `✅ ${roomType} Room Created: [${savedRoom.roomCode}] (ID: ${savedRoom.roomId})], Doc Id: [${document.docId}]`,
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

  protected generateRoomCode(roomCodeLength = LIMITS.ROOM_CODE_LENGTH): string {
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

  /**
   * 비밀번호 검증
   */
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
