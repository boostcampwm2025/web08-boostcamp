import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { Room } from './room.entity';
import { PtModule } from '../pt/pt.module';
import { Pt } from '../pt/pt.entity';
import { PtService } from '../pt/pt.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pt, Room]), PtModule],
  controllers: [RoomController],
  providers: [RoomService, PtService],
  exports: [RoomService], // 다른 모듈에서 사용 가능하도록 export
})
export class RoomModule {}
