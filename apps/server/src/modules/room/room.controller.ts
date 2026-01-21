import {
  Controller,
  Get,
  Param,
  Post,
  NotFoundException,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateCustomRoomDto } from './dto/create-custom-room.dto';
import { CreateRoomResponseDto } from './dto/create-room-response.dto';
import { PtService } from '../pt/pt.service';

@Controller('api/rooms')
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly ptService: PtService,
  ) {}

  @Get(':roomCode/join')
  async checkRoomExists(@Param('roomCode') roomCode: string) {
    const room = await this.roomService.findRoomByCode(roomCode);
    if (!room) throw new NotFoundException('ROOM_NOT_FOUND');

    const counter = await this.ptService.roomCounter(room.roomId);
    if (counter >= room.maxPts) return { max: true, exists: true };

    return { max: false, exists: true };
  }

  @Post(':roomCode/checkHost')
  async checkHost(
    @Param('roomCode') roomCode: string,
    @Body('ptId') ptId: string,
  ) {
    // TODO: Validation pipe
    if (!roomCode || !ptId) throw new BadRequestException();

    const room = await this.roomService.findRoomByCode(roomCode);
    if (!room) throw new NotFoundException('ROOM_NOT_FOUND');

    const roomId = room.roomId;
    const isHost = await this.roomService.checkHost(roomId, ptId);

    return { ok: isHost };
  }

  @Post('quick')
  async createQuickRoom(): Promise<CreateRoomResponseDto> {
    return await this.roomService.createQuickRoom();
  }

  @Post('custom')
  async createCustomRoom(
    dto: CreateCustomRoomDto,
  ): Promise<CreateRoomResponseDto> {
    return await this.roomService.createCustomRoom(dto);
  }
}
