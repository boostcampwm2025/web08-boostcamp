import { Module } from '@nestjs/common';
import { CollaborationGateway } from './collaboration.gateway';
import { CollaborationService } from './collaboration.service';
import { RoomModule } from '../room/room.module';
import { PtModule } from '../pt/pt.module';
import { FileModule } from '../file/file.module';
import { RedisModule } from '../../config/redis.module';

@Module({
  imports: [RedisModule, RoomModule, PtModule, FileModule],
  providers: [CollaborationGateway, CollaborationService],
  exports: [CollaborationGateway, CollaborationService],
})
export class CollaborationModule {}
