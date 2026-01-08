import {
  Controller,
  Get,
  Param,
  Post,
  NotFoundException,
  Body,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomResponseDto } from './dto/create-room-response.dto';

@Controller('api/rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get(':roomCode/exists')
  async checkRoomExists(@Param('roomCode') roomCode: string) {
    const exists = await this.roomService.roomExists(roomCode);
    if (!exists) {
      throw new NotFoundException({ exists: false });
    }
    return { exists: true };
  }

  @Get(':roomCode/join')
  async redirectToRoom(@Param('roomCode') roomCode: string) {
    const exists = await this.roomService.roomExists(roomCode);
    if (!exists) throw new NotFoundException();

    const redirectUrl = `/rooms/${roomCode}`;
    return { url: redirectUrl };
  }

  @Post(':roomCode/checkHost')
  async checkHost(
    @Param('roomCode') roomCode: string,
    @Body('ptId') ptId: string | undefined,
  ) {
    const ok = await this.roomService.checkHost(roomCode, ptId || '');
    return { ok };
  }

  @Post('quick')
  async createQuickRoom(): Promise<CreateRoomResponseDto> {
    return await this.roomService.createQuickRoom();
  }
}
