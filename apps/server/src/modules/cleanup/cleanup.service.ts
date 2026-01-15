import { Injectable, Logger } from '@nestjs/common';
import { RoomService } from '../room/room.service';
import { CollaborationGateway } from '../collaboration/collaboration.gateway';
import { FileService } from '../file/file.service';
import { DocumentService } from '../document/document.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    private readonly roomService: RoomService,
    private readonly collaborationGateway: CollaborationGateway,
    private readonly fileService: FileService,
    private readonly documentService: DocumentService,
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

      // 3. Y.Doc 정리
      const roomIdsToDelete = expiredRooms.map((room) => room.roomId);
      const docIds =
        await this.documentService.getDocIdsByRoomIds(roomIdsToDelete);
      await this.fileService.cleanupDocs(docIds);

      // 4. DB에서 방 삭제
      const deletedCount = await this.roomService.deleteRooms(roomIdsToDelete);

      this.logger.log(
        `🧹 Cleanup Complete: Deleted ${deletedCount} expired rooms. (Targets: ${expiredRooms.map((r) => r.roomCode).join(', ')})`,
      );
    } catch (error) {
      this.logger.error('❌ Failed to execute room cleanup', error.stack);
    }
  }
}
