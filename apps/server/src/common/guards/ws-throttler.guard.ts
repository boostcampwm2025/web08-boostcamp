import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';
import { ERROR_CODE, ERROR_MESSAGES } from '@codejam/common';
import { WsApiException } from '../exceptions/ws-api.exception';

@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
  protected getRequestResponse(context: ExecutionContext) {
    const wsCtx = context.switchToWs();
    const client = wsCtx.getClient();

    return {
      req: {
        ip: client.conn.remoteAddress,
        headers: client.handshake.headers,
      },
      res: client,
    };
  }

  protected throwThrottlingException(context: ExecutionContext): Promise<void> {
    const event = Reflect.getMetadata('message', context.getHandler());

    throw new WsApiException(
      ERROR_CODE.TOO_MANY_REQUESTS,
      ERROR_MESSAGES.TOO_MANY_REQUESTS,
      event,
    );
  }
}
