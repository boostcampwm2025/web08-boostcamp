import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ERROR_CODE, ERROR_MESSAGES } from '@codejam/common';
import { WsApiException } from '../exceptions/ws-api.exception';

@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
  protected generateKey(
    context: ExecutionContext,
    suffix: string,
    name: string,
  ): string {
    const client = context.switchToWs().getClient();
    return `${suffix}-${name}-${client.id}`;
  }

  protected getRequestResponse(context: ExecutionContext) {
    const wsCtx = context.switchToWs();
    const client = wsCtx.getClient();

    return {
      req: {
        // 내부 로직용 객체 구조 유지
        ip: client.id,
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
