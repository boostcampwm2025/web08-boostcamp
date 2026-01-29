import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ERROR_CODE, ERROR_MESSAGES, SOCKET_EVENTS } from '@codejam/common';
import { WsApiException } from '../exceptions/ws-api.exception';

@Catch()
export class WsExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();

    let targetEvent = 'error';

    let code: string = ERROR_CODE.SERVER_ERROR;
    let message: string = ERROR_MESSAGES.SERVER_ERROR;

    if (exception instanceof WsApiException) {
      code = exception.code;
      message = exception.message;

      if (exception.targetEvent) {
        targetEvent = this.mapToErrorEvent(exception.targetEvent);
      }
    }

    client.emit(targetEvent, { type: code, message: message });
  }

  private mapToErrorEvent(event: string): string {
    const mapping: Record<string, string> = {
      [SOCKET_EVENTS.EXECUTE_CODE]: SOCKET_EVENTS.CODE_EXECUTION_ERROR,
    };
    return mapping[event] || 'error';
  }
}
