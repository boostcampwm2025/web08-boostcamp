import { Module } from '@nestjs/common';
import { CollaborationGateway } from './collaboration.gateway';
import { CollaborationService } from './collaboration.service';
import { RoomModule } from '../room/room.module';
import { PtModule } from '../pt/pt.module';
import { FileModule } from '../file/file.module';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../../config/redis.module';
import { PermissionGuard } from './guards/permission.guard';

@Module({
  imports: [RedisModule, RoomModule, PtModule, FileModule, AuthModule],
  providers: [CollaborationGateway, CollaborationService, PermissionGuard],
  exports: [CollaborationGateway, CollaborationService],
})
export class CollaborationModule {}
