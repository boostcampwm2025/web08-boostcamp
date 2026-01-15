import { Module } from '@nestjs/common';
import { CleanupService } from './cleanup.service';
import { ScheduleModule } from '@nestjs/schedule';
import { RoomModule } from '../room/room.module';
import { CollaborationModule } from '../collaboration/collaboration.module';
import { FileModule } from '../file/file.module';
import { DocumentModule } from '../document/document.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CollaborationModule,
    RoomModule,
    FileModule,
    DocumentModule,
  ],
  providers: [CleanupService],
})
export class CleanupModule {}
