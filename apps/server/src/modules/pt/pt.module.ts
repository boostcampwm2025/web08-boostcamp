import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PtService } from './pt.service';
import { Pt } from './pt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pt])],
  providers: [PtService],
  exports: [PtService],
})
export class PtModule {}
