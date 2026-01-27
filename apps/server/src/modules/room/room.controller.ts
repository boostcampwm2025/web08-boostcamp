import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateCustomRoomRequestDto } from './dto/create-custom-room-request.dto';
import { CreateQuickRoomResponseDto } from './dto/create-quick-room-response.dto';
import { CreateCustomRoomResponseDto } from './dto/create-custom-room-response.dto';
import { PtService } from '../pt/pt.service';
import {
  CheckRoomJoinableResponse,
  API_ENDPOINTS,
  ROOM_JOIN_STATUS,
} from '@codejam/common';
import { CommonThrottlerGuard } from '../../common/guards/common-throttler.guard';
import { Throttle } from '@nestjs/throttler';

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
  ): Promise<CreateCustomRoomResponseDto> {
    return await this.roomService.createCustomRoom(dto);
  }
}
