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

      // 2. 소켓 알림 및 연결 종료 (방 별로 순회)
      await Promise.all(
        expiredRooms.map((room) => {
          this.collaborationGateway.notifyAndDisconnectRoom(room.roomCode);
        }),
      );

      // 3. DB에서 방 삭제
      const roomIdsToDelete = expiredRooms.map((room) => room.roomId);
      const deletedCount = await this.roomService.deleteRooms(roomIdsToDelete);

      this.logger.log(
        `🧹 Cleanup Complete: Deleted ${deletedCount} expired rooms. (Targets: ${expiredRooms.map((r) => r.roomCode).join(', ')})`,
      );
    } catch (error) {
      this.logger.error('❌ Failed to execute room cleanup', error.stack);
    }
  }
}
