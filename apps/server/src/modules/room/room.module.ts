import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { Room } from './room.entity';
import { PtModule } from '../pt/pt.module';
import { Pt } from '../pt/pt.entity';
import { PtService } from '../pt/pt.service';
import { AuthModule } from '../auth/auth.module';
import { FileModule } from '../file/file.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pt, Room]),
    PtModule,
    FileModule,
    AuthModule,
  ],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}
