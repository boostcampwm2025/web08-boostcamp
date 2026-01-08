import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { PtService } from '../../pt/pt.service';
import { PtRole } from '../../pt/pt.entity';
import type { CollabSocket } from '../collaboration.types';

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(private readonly ptService: PtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<CollabSocket>();

    const { roomId, ptId } = client.data;

    if (!roomId || !ptId) {
      this.logger.warn(
        `Missing roomId or ptId: roomId=${roomId}, ptId=${ptId}`,
      );
      client.emit('error', {
        type: 'PERMISSION_DENIED',
        message: '방 정보 또는 사용자 정보가 없습니다',
      });
      return false;
    }

    // 권한 조회
    const role = await this.ptService.getUserRole(roomId, ptId);

    if (!role) {
      this.logger.warn(`User not found: roomId=${roomId}, ptId=${ptId}`);
      client.emit('error', {
        type: 'PERMISSION_DENIED',
        message: '사용자를 찾을 수 없습니다',
      });
      return false;
    }

    if (role === PtRole.VIEWER) {
      this.logger.warn(
        `Permission denied: roomId=${roomId}, ptId=${ptId}, role=${role}`,
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
      `Permission granted: roomId=${roomId}, ptId=${ptId}, role=${role}`,
    );
    return true;
  }
}
