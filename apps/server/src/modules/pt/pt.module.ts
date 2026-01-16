import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PtService } from './pt.service';
import { Pt } from './pt.entity';
import { Room } from '../room/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pt, Room])],
  providers: [PtService],
  exports: [PtService],
})
export class PtModule {}
