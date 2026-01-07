import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';

/** 방의 생명 주기 관리 */

@Injectable()
export class RoomService {
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
}
