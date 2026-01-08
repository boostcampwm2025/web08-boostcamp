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

    try {
      // 1. 만료된 방 조회
      const expiredRooms = await this.roomService.findExpiredRooms();

      if (expiredRooms.length === 0) {
        this.logger.debug('✨ No expired rooms found.');
        return;
      }

      /**
       * TODO:
       * 2. 소켓 알림 및 연결 종료 (방 별로 순회)
       * 3. DB에서 방 삭제
       */
    } catch (error) {
      this.logger.error('❌ Failed to execute room cleanup', error.stack);
    }
  }
}
