import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CodeExecutionService } from './code-execution.service';

@Module({
  imports: [HttpModule],
  providers: [CodeExecutionService],
  exports: [CodeExecutionService],
})
export class CodeExecutionModule {}
