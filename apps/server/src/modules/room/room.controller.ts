import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateCustomRoomRequestDto } from './dto/create-custom-room-request.dto';
import { CreateQuickRoomResponseDto } from './dto/create-quick-room-response.dto';
import { CreateCustomRoomResponseDto } from './dto/create-custom-room-response.dto';
import { PtService } from '../pt/pt.service';
import {
  CheckRoomJoinableResponse,
  API_ENDPOINTS,
  ROOM_JOIN_STATUS,
  ROOM_CONFIG,
} from '@codejam/common';
import { CommonThrottlerGuard } from '../../common/guards/common-throttler.guard';
import { Throttle } from '@nestjs/throttler';
import { type Response } from 'express';

@Controller()
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly ptService: PtService,
  ) {}

  @Get(API_ENDPOINTS.ROOM.JOINABLE(':roomCode'))
  async checkRoomJoinable(
    @Param('roomCode') roomCode: string,
  ): Promise<CheckRoomJoinableResponse> {
    const room = await this.roomService.findRoomByCode(roomCode);
    if (!room) return ROOM_JOIN_STATUS.NOT_FOUND;

    const counter = await this.ptService.roomCounter(room.roomId);
    if (counter >= room.maxPts) return ROOM_JOIN_STATUS.FULL;

    return ROOM_JOIN_STATUS.JOINABLE;
  }

  @Post(API_ENDPOINTS.ROOM.CREATE_QUICK)
  @UseGuards(CommonThrottlerGuard)
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  async createQuickRoom(): Promise<CreateQuickRoomResponseDto> {
    return await this.roomService.createQuickRoom();
  }

  @Post(API_ENDPOINTS.ROOM.CREATE_CUSTOM)
  @UseGuards(CommonThrottlerGuard)
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  async createCustomRoom(
    @Body() dto: CreateCustomRoomRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CreateCustomRoomResponseDto> {
    const { roomCode, token } = await this.roomService.createCustomRoom(dto);

    this.setAuthCookie(res, roomCode, token);

    return { roomCode };
  }

  @Post(API_ENDPOINTS.ROOM.JOIN(':roomCode'))
  async joinRoom(
    @Param('roomCode') roomCode: string,
    @Body() body: { nickname: string; password?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    // 1. 유저 생성
    const { token } = await this.roomService.joinRoom(
      roomCode,
      body.nickname,
      body.password,
    );

    // 2. Set-Cookie
    this.setAuthCookie(res, roomCode, token);

    return { success: true, token };
  }

  @Post(API_ENDPOINTS.ROOM.VERIFY(':roomCode'))
  async verifyPassword(
    @Param('roomCode') roomCode: string,
    @Body() body: { password?: string },
  ) {
    await this.roomService.verifyRoomPassword(
      roomCode.toUpperCase(),
      body?.password,
    );
    return { success: true };
  }

  @Get(API_ENDPOINTS.ROOM.AUTH_STATUS(':roomCode'))
  async getAuthStatus(@Param('roomCode') roomCode: string, @Req() req: any) {
    const token = req.cookies[`auth_${roomCode.toUpperCase()}`];
    return await this.roomService.checkAuthStatus(roomCode, token);
  }

  /**
   * 인증 쿠키 설정 헬퍼 메서드
   * 환경(Production/Dev)에 따른 Secure 옵션 처리 포함
   */
  private setAuthCookie(res: Response, roomCode: string, token: string) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie(`auth_${roomCode.toUpperCase()}`, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: ROOM_CONFIG.COOKIE_MAX_AGE,
      path: '/',
    });
  }
}
