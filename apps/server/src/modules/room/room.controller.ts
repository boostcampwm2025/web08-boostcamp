import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { RoomService } from './room.service';
import { SessionResponseDto } from '@codejam/common';

@Controller('api/room/prototype')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('session')
  @HttpCode(HttpStatus.CREATED)
  async createSession(): Promise<SessionResponseDto> {
    return this.roomService.createSession();
  }
}
