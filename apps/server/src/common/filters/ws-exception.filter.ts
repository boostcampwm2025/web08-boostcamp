import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ERROR_CODE, ERROR_MESSAGES } from '@codejam/common';
import { WsApiException } from '../exceptions/ws-api.exception';
import { ApiException } from '../exceptions/api.exception';

@Catch()
export class WsExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();

    let code: string = ERROR_CODE.SERVER_ERROR;
    let message: string = ERROR_MESSAGES.SERVER_ERROR;

    if (exception instanceof WsApiException) {
      code = exception.code;
      message = exception.message;
    } else if (exception instanceof ApiException) {
      code = exception.code;
      message = exception.message;
    } else if (exception instanceof WsException) {
      const errorResponse = exception.getError();
      message =
        typeof errorResponse === 'string'
          ? errorResponse
          : (errorResponse as any).message;
    } else {
      const error = exception as Error;
      this.logger.error(`[WS Unknown Error]`, error.stack);
    }

    client.emit('error', {
      type: code,
      message: message,
    });
  }
}
