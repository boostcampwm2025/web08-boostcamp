import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, LessThan, Repository } from 'typeorm';
import { DefaultRolePolicy, HostTransferPolicy, Room } from './room.entity';
import { customAlphabet } from 'nanoid';
import { Pt, PtRole } from '../pt/pt.entity';
import { CreateRoomResponseDto } from './dto/create-room-response.dto';
import { RoomCreationOptions } from './room.interface';

/** 방의 생명 주기 관리 */

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
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

  async createQuickRoom(): Promise<CreateRoomResponseDto> {
    const options: RoomCreationOptions = {
      hostTransferPolicy: HostTransferPolicy.AUTO_TRANSFER,
      defaultRolePolicy: DefaultRolePolicy.VIEWER,
    };

    return this.createRoom(options);
  }

  private async createRoom(
    options: RoomCreationOptions,
  ): Promise<CreateRoomResponseDto> {
    const roomCode = await this.generateUniqueRoomCode();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newRoom = queryRunner.manager.create(Room, {
        roomCode,
        hostTransferPolicy: options.hostTransferPolicy,
        defaultRolePolicy: options.defaultRolePolicy,
        roomPassword: options.roomPassword,
        hostPassword: options.hostPassword,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const savedRoom = await queryRunner.manager.save(newRoom);

      const hostPt = queryRunner.manager.create(Pt, {
        roomId: savedRoom.roomId,
        role: PtRole.HOST,
        code: '0000',
        nickname: 'Host',
        color: '#E0E0E0',
      });

      const savedPt = await queryRunner.manager.save(hostPt);

      await queryRunner.commitTransaction();

      this.logger.log(
        `✅ Quick Room Created: [${savedRoom.roomCode}] (ID: ${savedRoom.roomId}), Host Pt: [${savedPt.ptId}]`,
      );

      return {
        roomCode: savedRoom.roomCode,
        myPtId: savedPt.ptId,
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
    const alphabet =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
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
}
