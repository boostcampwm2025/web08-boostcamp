import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { PtRole } from '../../pt/pt.entity';
import { RoomService } from '../../room/room.service';
import { WhoCanDestroyRoom } from '../../room/room.entity';
import type { CollabSocket } from '../collaboration.types';

@Injectable()
export class DestroyRoomGuard implements CanActivate {
  private readonly logger = new Logger(DestroyRoomGuard.name);

  constructor(private readonly roomService: RoomService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<CollabSocket>();
    const { roomId, roomCode, ptId, role } = client.data;

    // 1. 기본 데이터 검증
    if (!roomId || !roomCode || !ptId || !role) {
      this.logger.warn(
        `Missing data: roomId=${roomId}, roomCode=${roomCode}, ptId=${ptId}, role=${role}`,
      );
      client.emit('error', {
        type: 'PERMISSION_DENIED',
        message: '방 정보 또는 사용자 정보가 없습니다',
      });
      return false;
    }

    // 2. 방 정보 조회
    const room = await this.roomService.findRoomById(roomId);
    if (!room) {
      this.logger.warn(`Room not found: roomId=${roomId}`);
      client.emit('error', {
        type: 'ROOM_NOT_FOUND',
        message: '방을 찾을 수 없습니다',
      });
      return false;
    }

    // 3. 권한 체크
    const { whoCanDestroyRoom } = room;
    const hasPermission = this.checkPermission(role, whoCanDestroyRoom);

    if (!hasPermission) {
      this.logger.warn(
        `Permission denied: roomCode=${roomCode}, ptId=${ptId}, role=${role}, whoCanDestroyRoom=${whoCanDestroyRoom}`,
      );
      client.emit('error', {
        type: 'PERMISSION_DENIED',
        message: '방을 폭파할 권한이 없습니다',
        currentRole: role,
        requiredRole: whoCanDestroyRoom,
      });
      return false;
    }

    this.logger.debug(
      `Permission granted for destroy: roomCode=${roomCode}, ptId=${ptId}, role=${role}`,
    );
    return true;
  }

  /**
   * 권한 체크 로직
   * - HOST: HOST만 가능
   * - EDITOR: EDITOR만 가능
   */
  private checkPermission(
    role: PtRole,
    whoCanDestroyRoom: WhoCanDestroyRoom,
  ): boolean {
    if (whoCanDestroyRoom === WhoCanDestroyRoom.HOST) {
      return role === PtRole.HOST;
    }

    if (whoCanDestroyRoom === WhoCanDestroyRoom.EDITOR) {
      return role === PtRole.EDITOR;
    }

    return false;
  }
}
