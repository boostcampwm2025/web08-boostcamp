import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateCustomRoomDto } from './dto/create-custom-room.dto';
import { CreateRoomResponseDto } from './dto/create-room-response.dto';
import { PtService } from '../pt/pt.service';
import { RoomJoinStatus } from '@codejam/common';

@Controller('api/rooms')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly ptService: PtService,
  ) {}

  @Get(':roomCode/joinable')
  async checkRoomExists(
    @Param('roomCode') roomCode: string,
  ): Promise<RoomJoinStatus> {
    const room = await this.roomService.findRoomByCode(roomCode);
    if (!room) return 'NOT_FOUND';

    const counter = await this.ptService.roomCounter(room.roomId);
    if (counter >= room.maxPts) return 'FULL';

    return 'JOINABLE';
  }

  @Post('quick')
  async createQuickRoom(
    @Body('password') password?: string,
  ): Promise<CreateRoomResponseDto> {
    return await this.roomService.createQuickRoom(password);
  }

  @Post('custom')
  async createCustomRoom(
    @Body() dto: CreateCustomRoomDto,
  ): Promise<CreateRoomResponseDto> {
    return await this.roomService.createCustomRoom(dto);
  }
}
