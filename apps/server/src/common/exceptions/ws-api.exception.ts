import { WsException } from '@nestjs/websockets';
import { ERROR_CODE } from '@codejam/common';

type ErrorCode = keyof typeof ERROR_CODE;

export class WsApiException extends WsException {
  constructor(
    public readonly code: keyof typeof ERROR_CODE,
    public readonly message: string,
    public readonly targetEvent?: string,
  ) {
    super({ code, message, targetEvent });
  }
}
