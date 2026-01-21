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
