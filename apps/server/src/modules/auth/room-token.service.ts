import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { RoomToken, RoomTokenPayload } from '@codejam/common';

@Injectable()
export class RoomTokenService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.secret = this.configService.get<string>('JWT_ROOM_TOKEN_SECRET')!;
    this.expiresIn = this.configService.get<string>(
      'JWT_ROOM_TOKEN_EXPIRES_IN',
    )!;
  }

  sign(payload: RoomTokenPayload): RoomToken {
    return this.jwtService.sign(payload, {
      secret: this.secret,
      expiresIn: this.expiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`,
    });
  }

  verify(token: RoomToken): RoomTokenPayload | null {
    try {
      const payload = this.jwtService.verify<RoomTokenPayload>(token, {
        secret: this.secret,
      });
      return payload;
    } catch {
      return null;
    }
  }

  /**
   * 토큰에서 payload 추출 (검증 없이)
   */
  decode(token: RoomToken): RoomTokenPayload | null {
    try {
      return this.jwtService.decode<RoomTokenPayload>(token);
    } catch {
      return null;
    }
  }
}
