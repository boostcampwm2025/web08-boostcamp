import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { PtRole } from '../../pt/pt.entity';
import type { CollabSocket } from '../collaboration.types';

@Injectable()
export class NotHostGuard implements CanActivate {
  private readonly logger = new Logger(NotHostGuard.name);

  canActivate(context: ExecutionContext): boolean {
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

    if (role === PtRole.HOST) {
      this.logger.warn(
        `Already host: roomCode=${roomCode}, ptId=${ptId}, role=${role}`,
      );
      client.emit('error', {
        type: 'ALREADY_HOST',
        message: '이미 호스트입니다',
      });
      return false;
    }

    this.logger.debug(
      `Not host check passed: roomCode=${roomCode}, ptId=${ptId}, role=${role}`,
    );
    return true;
  }
}
