import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { PtRole } from '../../pt/pt.entity';
import type { CollabSocket } from '../collaboration.types';

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<CollabSocket>();

    const { roomCode, ptId, role } = client.data;

    if (!roomCode || !ptId || !role) {
      this.logger.warn(
        `Missing data: roomCode=${roomCode}, ptId=${ptId}, role=${role}`,
      );
      client.emit('error', {
        type: 'PERMISSION_DENIED',
        message: '방 정보 또는 사용자 정보가 없습니다',
      });
      return false;
    }

    // socket.data에서 직접 role 확인
    if (role === PtRole.VIEWER) {
      this.logger.warn(
        `Permission denied: roomCode=${roomCode}, ptId=${ptId}, role=${role}`,
      );
      client.emit('error', {
        type: 'PERMISSION_DENIED',
        message: '편집 권한이 없습니다',
        currentRole: role,
        requiredRoles: [PtRole.EDITOR, PtRole.HOST],
      });
      return false;
    }

    this.logger.debug(
      `Permission granted: roomCode=${roomCode}, ptId=${ptId}, role=${role}`,
    );
    return true;
  }
}
