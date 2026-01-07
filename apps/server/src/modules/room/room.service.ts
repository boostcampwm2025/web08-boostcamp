import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DefaultRolePolicy, HostTransferPolicy, Room } from './room.entity';

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
    const roomCode = 'a1B2c3';

    const newRoom = this.roomRepository.create({
      roomCode,
      hostTransferPolicy: HostTransferPolicy.AUTO_TRANSFER,
      defaultRolePolicy: DefaultRolePolicy.VIEWER,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    const savedRoom = await this.roomRepository.save(newRoom);

    this.logger.log(
      `✅ Quick Room Created: [${savedRoom.roomCode}] (ID: ${savedRoom.roomId})`,
    );
  }
}
