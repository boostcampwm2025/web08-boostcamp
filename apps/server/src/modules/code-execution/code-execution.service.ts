import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
  ERROR_CODE,
  ERROR_MESSAGES,
  CODE_EXECUTION_LIMITS,
  type ExecuteCodeRequest,
  type ExecuteCodeResponse,
} from '@codejam/common';
import {
  ExecuteCodeRequestDto,
  ExecuteCodeResponseDto,
} from './dto/execute-code.dto';
import { ApiException } from '../../common/exceptions/api.exception';

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
    const { language, version, files, stdin, args } = dto;

    const message = `Executing ${language} (${version}) code with ${files.length} file(s)`;
    this.logger.log(message);

    // Build Piston API request

    const request: ExecuteCodeRequest = {
      language,
      version,
      files,
      stdin,
      args,
      compile_timeout: CODE_EXECUTION_LIMITS.COMPILE_TIMEOUT,
      run_timeout: CODE_EXECUTION_LIMITS.RUN_TIMEOUT,
      compile_cpu_time: CODE_EXECUTION_LIMITS.COMPILE_CPU_TIME,
      run_cpu_time: CODE_EXECUTION_LIMITS.RUN_CPU_TIME,
      compile_memory_limit: CODE_EXECUTION_LIMITS.COMPILE_MEMORY_LIMIT,
      run_memory_limit: CODE_EXECUTION_LIMITS.RUN_MEMORY_LIMIT,
    };

    // Execute code

    const url = `${this.PISTON_API_URL}/execute`;

    try {
      const response = await firstValueFrom(
        this.httpService.post<ExecuteCodeResponse>(url, request),
      );

      const result = response.data;

      this.logger.log(
        `Execution completed: ${language} ${version} - ` +
          `Status: ${result.run.status || 'OK'}, ` +
          `Exit code: ${result.run.code}`,
      );

      return result as ExecuteCodeResponseDto;
    } catch (error) {
      // Unknown errors
      if (!(error instanceof AxiosError)) {
        this.logger.error(`Unexpected error: ${error}`);

        throw new ApiException(
          ERROR_CODE.CODE_EXECUTION_FAILED,
          ERROR_MESSAGES.CODE_EXECUTION_FAILED,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Network/connection errors
      if (!error.response) {
        this.logger.error(`Network error: ${error.message}`);

        throw new ApiException(
          ERROR_CODE.CODE_EXECUTION_SERVICE_UNAVAILABLE,
          ERROR_MESSAGES.CODE_EXECUTION_SERVICE_UNAVAILABLE,
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      // Piston API error
      const data = error.response.data as { message?: string };
      const message = `Piston API error (${error.response.status}): 
        ${data?.message || error.message}`;
      this.logger.error(message);

      throw new ApiException(
        ERROR_CODE.CODE_EXECUTION_FAILED,
        ERROR_MESSAGES.CODE_EXECUTION_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
