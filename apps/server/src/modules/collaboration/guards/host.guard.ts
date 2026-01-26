import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { MESSAGE, ERROR_CODE, ROLE, type PtRole } from '@codejam/common';
import type { CollabSocket } from '../collaboration.types';

@Injectable()
export class HostGuard implements CanActivate {
  private readonly logger = new Logger(HostGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<CollabSocket>();

    const { roomCode, ptId, role } = client.data;

    if (!roomCode || !ptId || !role) {
      this.logger.warn(
        `Missing data: roomCode=${roomCode}, ptId=${ptId}, role=${role}`,
      );
      client.emit('error', {
        type: ERROR_CODE.PERMISSION_DENIED,
        message: '방 정보 또는 사용자 정보가 없습니다',
      });
      return false;
    }

    // socket.data에서 직접 role 확인
    if (role !== ROLE.HOST) {
      this.logger.warn(
        `Permission denied: roomCode=${roomCode}, ptId=${ptId}, role=${role}`,
      );
      client.emit('error', {
        type: ERROR_CODE.PERMISSION_DENIED,
        message: MESSAGE.ERROR.NOT_HOST,
        currentRole: role,
        requiredRoles: [ROLE.HOST],
      });
      return false;
    }

    this.logger.debug(
      `Permission granted: roomCode=${roomCode}, ptId=${ptId}, role=${role}`,
    );
    return true;
  }
}
