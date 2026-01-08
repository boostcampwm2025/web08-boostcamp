import { Injectable, Logger } from '@nestjs/common';
import { RoomService } from '../room/room.service';
import { CollaborationGateway } from '../collaboration/collaboration.gateway';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    private readonly roomService: RoomService,
    private readonly collaborationGateway: CollaborationGateway,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleRoomCleanup() {
    this.logger.log('🕒 Starting scheduled room cleanup...');

    /**
     * TODO:
     * 1. 만료된 방 조회
     * 2. 소켓 알림 및 연결 종료 (방 별로 순회)
     * 3. DB에서 방 삭제
     */
  }
}
