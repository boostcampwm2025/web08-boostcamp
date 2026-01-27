import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as cookie from 'cookie';
import { Socket } from 'socket.io';

export const WsToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const client = ctx.switchToWs().getClient<Socket>();
    const payload = ctx.switchToWs().getData();

    // 1. 방 코드 확인
    const roomCode = payload?.roomCode?.toUpperCase();
    if (!roomCode) return null;

    // 2. 쿠키 파싱
    const rawCookies = client.handshake.headers.cookie;
    if (!rawCookies) return null;

    const parsedCookies = cookie.parse(rawCookies);

    // 3. 해당 방 전용 토큰 반환 or null
    return parsedCookies[`auth_${roomCode}`] || null;
  },
);
