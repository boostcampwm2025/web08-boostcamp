import { Module } from '@nestjs/common';
import { PtService } from './pt.service';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [RoomModule],
  providers: [PtService],
  exports: [PtService],
})
export class PtModule {}
