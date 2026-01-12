import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { DocumentService } from './document.service';
@Module({
  imports: [TypeOrmModule.forFeature([Document])],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
