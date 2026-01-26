import { ERROR_CODE, ERROR_MESSAGES } from '@codejam/common';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiException } from '../exceptions/api.exception';
import { error } from 'console';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ERROR_CODE.SERVER_ERROR;
    let message: string = ERROR_MESSAGES.SERVER_ERROR;

    if (exception instanceof ApiException) {
      status = exception.getStatus();
      code = exception.code;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;

      code = this.mapStatusToErrorCode(status);
    } else {
      const error = exception as Error;
      // 보안상 상세 내용은 숨김
      this.logger.error(`[Unknown Error] ${request.url}`, error.stack);
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private mapStatusToErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ERROR_CODE.INVALID_INPUT;
      case HttpStatus.UNAUTHORIZED:
        return ERROR_CODE.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ERROR_CODE.PERMISSION_DENIED;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ERROR_CODE.TOO_MANY_REQUESTS;
      default:
        return ERROR_CODE.SERVER_ERROR;
    }
  }
}
