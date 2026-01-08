import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomResponseDto } from './dto/create-room-response.dto';

@Controller('api/room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get(':roomId/exists')
  async checkRoomExists(@Param('roomId') roomId: string) {
    const exists = await this.roomService.roomExists(roomId);
    if (!exists) {
      throw new NotFoundException({ exists: false });
    }
    return { exists: true };
  }

  @Post('quick')
  async createQuickRoom(): Promise<CreateRoomResponseDto> {
    return await this.roomService.createQuickRoom();
  }
}
