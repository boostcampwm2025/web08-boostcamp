import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';
import { ApiException } from '../exceptions/api.exception';
import { ERROR_CODE, ERROR_MESSAGES } from '@codejam/common';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException() {
    throw new ApiException(
      ERROR_CODE.TOO_MANY_REQUESTS,
      ERROR_MESSAGES.TOO_MANY_REQUESTS,
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
