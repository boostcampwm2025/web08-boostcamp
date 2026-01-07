import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DefaultRolePolicy, HostTransferPolicy, Room } from './room.entity';
import { customAlphabet } from 'nanoid';

/** 방의 생명 주기 관리 */

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  /**
   * 방 존재 여부 확인
   */
  async roomExists(roomId: string): Promise<boolean> {
    // TODO: DB에서 해당 방 존재 여부 판단 필요
    return true;
  }

  async createQuickRoom() {
    const maxRetries = 3;
    let roomCode = '';
    let isUnique = false;

    for (let i = 0; i < maxRetries; i++) {
      roomCode = this.generateRoomCode();

      const existingRoom = await this.roomRepository.findOne({
        where: { roomCode },
      });

      if (!existingRoom) {
        isUnique = true;
        break;
      }

      this.logger.warn(
        `Room code collision detected: ${roomCode}. Retrying... (${i + 1}/${maxRetries})`,
      );
    }

    if (!isUnique || roomCode.length !== 6) {
      throw new InternalServerErrorException(
        'Failed to generate unique room code',
      );
    }

    const newRoom = this.roomRepository.create({
      roomCode,
      hostTransferPolicy: HostTransferPolicy.AUTO_TRANSFER,
      defaultRolePolicy: DefaultRolePolicy.VIEWER,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const savedRoom = await this.roomRepository.save(newRoom);

    this.logger.log(
      `✅ Quick Room Created: [${savedRoom.roomCode}] (ID: ${savedRoom.roomId})`,
    );
  }

  protected generateRoomCode(): string {
    const alphabet =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const nanoid = customAlphabet(alphabet, 6);
    return nanoid();
  }
}
