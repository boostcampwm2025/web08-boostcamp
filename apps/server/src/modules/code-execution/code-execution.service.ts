import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
  ERROR_CODE,
  type ExecuteCodeRequest,
  type ExecuteCodeResponse,
} from '@codejam/common';
import {
  ExecuteCodeRequestDto,
  ExecuteCodeResponseDto,
} from './dto/execute-code.dto';

@Injectable()
export class CodeExecutionService {
  private readonly logger = new Logger(CodeExecutionService.name);
  private readonly PISTON_API_URL: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.PISTON_API_URL = this.configService.get<string>('PISTON_API_URL')!;
    this.logger.log(`Piston API URL: ${this.PISTON_API_URL}`);
  }

  /**
   * Execute code using Piston API
   * @param dto Code execution request
   * @returns Execution result including stdout, stderr, and exit code
   */
  async execute(dto: ExecuteCodeRequestDto): Promise<ExecuteCodeResponseDto> {
    const { language, version, files } = dto;

    const message = `Executing ${language} (${version}) code with ${files.length} file(s)`;
    this.logger.log(message);

    try {
      const response = await firstValueFrom(
        this.httpService.post<ExecuteCodeResponse>(
          `${this.PISTON_API_URL}/execute`,
          dto as ExecuteCodeRequest,
        ),
      );

      const result = response.data;

      this.logger.log(
        `Execution completed: ${language} ${version} - ` +
          `Status: ${result.run.status || 'OK'}, ` +
          `Exit code: ${result.run.code}`,
      );

      return result as ExecuteCodeResponseDto;
    } catch (error) {
      if (error instanceof AxiosError) {
        const data = error.response?.data as { message?: string };
        const status = error.response?.status;

        const message = `Piston API error (${status}): ${data?.message || error.message}`;
        this.logger.error(message);

        // Network/connection errors
        if (!error.response) {
          this.logger.error(`Network error: ${error.message}`);
          throw new Error(ERROR_CODE.CODE_EXECUTION_SERVICE_UNAVAILABLE);
        }

        throw new Error(ERROR_CODE.CODE_EXECUTION_FAILED);
      }

      // Custom error
      if (error.message in ERROR_CODE) {
        throw error;
      }

      // Unknown errors
      this.logger.error(`Unexpected error: ${error}`);
      throw new Error(ERROR_CODE.CODE_EXECUTION_FAILED);
    }
  }
}
