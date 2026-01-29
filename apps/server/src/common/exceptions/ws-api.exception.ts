import { WsException } from '@nestjs/websockets';
import { ERROR_CODE } from '@codejam/common';

type ErrorCode = keyof typeof ERROR_CODE;

export class WsApiException extends WsException {
  public readonly code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super({ code, message });
    this.code = code;
  }
}
