import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { RoomType } from '../../room/room.entity';
import type { CollabSocket } from '../collaboration.types';

@Injectable()
export class CustomRoomGuard implements CanActivate {
  private readonly logger = new Logger(CustomRoomGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<CollabSocket>();

    const { roomCode, ptId, roomType } = client.data;

    if (!roomCode || !ptId || !roomType) {
      this.logger.warn(
        `Missing data: roomCode=${roomCode}, ptId=${ptId}, roomType=${roomType}`,
      );
      client.emit('error', {
        type: 'PERMISSION_DENIED',
        message: '방 정보가 없습니다',
      });
      return false;
    }

    if (roomType !== RoomType.CUSTOM) {
      this.logger.warn(
        `Custom room only: roomCode=${roomCode}, ptId=${ptId}, roomType=${roomType}`,
      );
      client.emit('error', {
        type: 'CUSTOM_ROOM_ONLY',
        message: '커스텀 룸에서만 사용 가능한 기능입니다',
      });
      return false;
    }

    this.logger.debug(
      `Custom room check passed: roomCode=${roomCode}, ptId=${ptId}`,
    );
    return true;
  }
}
