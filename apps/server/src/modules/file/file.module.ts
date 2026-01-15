import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { DocumentModule } from '../document/document.module';

@Module({
  imports: [DocumentModule],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
