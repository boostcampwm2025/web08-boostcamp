import { Module } from '@nestjs/common';
import { PtService } from './pt.service';

@Module({
  providers: [PtService],
  exports: [PtService],
})
export class PtModule {}
