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
    const roomCode = await this.generateUniqueRoomCode();

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

  private async generateUniqueRoomCode(maxRetries = 3): Promise<string> {
    for (let i = 0; i < maxRetries; i++) {
      const roomCode = this.generateRoomCode();

      const existingRoom = await this.roomRepository.findOne({
        where: { roomCode },
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
}
