import { Module } from '@nestjs/common';
import { CleanupService } from './cleanup.service';
import { ScheduleModule } from '@nestjs/schedule';
import { RoomModule } from '../room/room.module';
import { CollaborationModule } from '../collaboration/collaboration.module';

@Module({
  imports: [ScheduleModule.forRoot(), RoomModule, CollaborationModule],
  providers: [CleanupService],
})
export class CleanupModule {}
