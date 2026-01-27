import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_CODE } from '@codejam/common';

type ErrorCode = keyof typeof ERROR_CODE;

export class ApiException extends HttpException {
  public readonly code: ErrorCode;

  constructor(
    code: ErrorCode,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(`${code}: ${message}`, status);

    this.code = code;
    this.message = message;
  }
}
