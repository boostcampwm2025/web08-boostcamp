import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import WebSocket from 'ws';
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
import type {
  WebSocketHandlerContext,
  CodeExecutionEventCallbacks,
} from './code-execution.types';
import { ApiException } from '../../common/exceptions/api.exception';
import { PistonErrorCode } from './code-execution.constants';

@Injectable()
export class CodeExecutionService {
  private readonly logger = new Logger(CodeExecutionService.name);

  private readonly PISTON_API_URL: string;
  private readonly PISTON_WS_URL: string;

  private readonly WS_CONNECTION_TIMEOUT = 5000;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const url = this.configService.get<string>('PISTON_API_URL')!;

    this.PISTON_API_URL = url;
    this.PISTON_WS_URL = url.replace(/^http/, 'ws') + '/connect';
  }

  /**
   * Execute code - Routes to once or interactive mode based on flag
   * @param dto Code execution request
   * @param interactive Flag to use interactive/streaming mode (default: false)
   * @param callbacks Event callbacks (required if interactive is true)
   * @returns Execution result (once mode) or void (interactive streaming)
   */
  async execute(
    dto: ExecuteCodeRequestDto,
    interactive = false,
    callbacks?: CodeExecutionEventCallbacks,
  ): Promise<ExecuteCodeResponseDto | void> {
    if (!interactive) {
      return this.executeOnce(dto);
    } else if (!callbacks) {
      const message = 'Event callbacks are required for interactive execution';
      this.logger.error(message);

      throw new ApiException(
        ERROR_CODE.CODE_EXECUTION_INVALID_CONFIG,
        ERROR_MESSAGES.CODE_EXECUTION_INVALID_CONFIG,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return this.executeInteractive(dto, callbacks);
  }

  /**
   * Execute code using Piston HTTP endpoint (returns result once after completion)
   * @param dto Code execution request
   * @returns Execution result including stdout, stderr, and exit code
   */
  private async executeOnce(
    dto: ExecuteCodeRequestDto,
  ): Promise<ExecuteCodeResponseDto> {
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

  /**
   * Execute code using Piston WebSocket endpoint (streaming)
   * @param dto Code execution request
   * @param callbacks Event callbacks to handle streaming events
   */
  private async executeInteractive(
    dto: ExecuteCodeRequestDto,
    callbacks: CodeExecutionEventCallbacks,
  ): Promise<void> {
    const { language, version, files, args } = dto;

    const message = `Executing code (Interactive)`;
    this.logger.log(message);

    // WebSocket connection
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.PISTON_WS_URL);

      // Connection timeout
      const connectionTimeout = setTimeout(() => {
        ws.close();
        this.logger.error('WebSocket connection timeout');
        callbacks.onError({
          error: ERROR_CODE.CODE_EXECUTION_SERVICE_UNAVAILABLE,
          message: ERROR_MESSAGES.CODE_EXECUTION_SERVICE_UNAVAILABLE,
        });
        reject(new Error('WebSocket Connection timeout'));
      }, this.WS_CONNECTION_TIMEOUT);

      // Create context for handlers
      const context: WebSocketHandlerContext = {
        ws,
        connectionTimeout,
        callbacks,
        resolve,
        reject,
        language,
        version,
        files,
        args,
      };

      // Register event handlers
      ws.on('open', () => this.handleWsOpen(context));
      ws.on('message', (data) => this.handleWsMessage(context, data));
      ws.on('error', (error) => this.handleWsError(context, error));
      ws.on('close', (code, reason) =>
        this.handleWsClose(context, code, reason),
      );
    });
  }

  /**
   * Handle WebSocket open event
   */
  private handleWsOpen(context: WebSocketHandlerContext): void {
    clearTimeout(context.connectionTimeout);
    this.logger.log('WebSocket connected to Piston');

    // Send init message to Piston
    const initMessage = {
      type: 'init',
      language: context.language,
      version: context.version,
      files: context.files,
      args: context.args,
      compile_timeout: CODE_EXECUTION_LIMITS.COMPILE_TIMEOUT,
      run_timeout: CODE_EXECUTION_LIMITS.RUN_TIMEOUT,
      compile_memory_limit: CODE_EXECUTION_LIMITS.COMPILE_MEMORY_LIMIT,
      run_memory_limit: CODE_EXECUTION_LIMITS.RUN_MEMORY_LIMIT,
    };

    context.ws.send(JSON.stringify(initMessage));
    this.logger.log('Sent init message to Piston');
  }

  /**
   * Handle WebSocket message event
   */
  private handleWsMessage(
    context: WebSocketHandlerContext,
    data: WebSocket.Data,
  ): void {
    try {
      const messageString = this.convertWebSocketDataToString(data);
      const message = JSON.parse(messageString);
      this.logger.debug(`Piston message: ${message.type}`);

      switch (message.type) {
        case 'runtime':
          context.callbacks.onStarted({
            language: message.language,
            version: message.version,
          });
          break;

        case 'stage':
          context.callbacks.onStage({
            stage: message.stage,
          });
          break;

        case 'data':
          context.callbacks.onData({
            stream: message.stream,
            data: message.data,
          });
          break;

        case 'exit':
          context.callbacks.onCompleted({
            code: message.code,
            signal: message.signal,
          });

          this.logger.log(
            `Execution completed: ${context.language} ${context.version} - ` +
              `Exit code: ${message.code}, Signal: ${message.signal}`,
          );

          context.ws.close();
          context.resolve();
          break;

        case 'error':
          this.logger.error(`Piston error: ${message.message}`);
          context.callbacks.onError({
            error: ERROR_CODE.CODE_EXECUTION_FAILED,
            message: message.message || ERROR_MESSAGES.CODE_EXECUTION_FAILED,
          });
          context.ws.close();
          context.reject(new Error(message.message));
          break;

        default:
          this.logger.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      this.logger.error(`Error parsing Piston message: ${error}`);
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleWsError(context: WebSocketHandlerContext, error: Error): void {
    clearTimeout(context.connectionTimeout);

    this.logger.error(`WebSocket error: ${error.message}`);
    context.callbacks.onError({
      error: ERROR_CODE.CODE_EXECUTION_SERVICE_UNAVAILABLE,
      message: ERROR_MESSAGES.CODE_EXECUTION_SERVICE_UNAVAILABLE,
    });

    context.reject(error);
  }

  /**
   * Handle WebSocket close event
   */
  private handleWsClose(
    context: WebSocketHandlerContext,
    code: number,
    reason: Buffer,
  ): void {
    clearTimeout(context.connectionTimeout);

    const message = `WebSocket closed: code=${code}, reason=${reason.toString()}`;
    this.logger.log(message);

    // Map Piston error code to application error
    const error = this.mapPistonErrorCode(code);

    // If error occurred, notify via callback
    if (error) {
      context.callbacks.onError({
        error: error.code,
        message: error.message,
      });
      context.reject(new Error(error.message));
    }
  }

  /**
   * Map Piston error code to application error code and message
   */
  private mapPistonErrorCode(
    code: number,
  ): { code: string; message: string } | null {
    switch (code) {
      case PistonErrorCode.ALREADY_INITIALIZED:
        return {
          code: ERROR_CODE.CODE_EXECUTION_ALREADY_INITIALIZED,
          message: ERROR_MESSAGES.CODE_EXECUTION_ALREADY_INITIALIZED,
        };
      case PistonErrorCode.INIT_TIMEOUT:
        return {
          code: ERROR_CODE.CODE_EXECUTION_INIT_TIMEOUT,
          message: ERROR_MESSAGES.CODE_EXECUTION_INIT_TIMEOUT,
        };
      case PistonErrorCode.NOTIFIED_ERROR:
        return {
          code: ERROR_CODE.CODE_EXECUTION_ERROR,
          message: ERROR_MESSAGES.CODE_EXECUTION_ERROR,
        };
      case PistonErrorCode.NOT_INITIALIZED:
        return {
          code: ERROR_CODE.CODE_EXECUTION_NOT_INITIALIZED,
          message: ERROR_MESSAGES.CODE_EXECUTION_NOT_INITIALIZED,
        };
      case PistonErrorCode.INVALID_STREAM:
        return {
          code: ERROR_CODE.CODE_EXECUTION_INVALID_STREAM,
          message: ERROR_MESSAGES.CODE_EXECUTION_INVALID_STREAM,
        };
      case PistonErrorCode.INVALID_SIGNAL:
        return {
          code: ERROR_CODE.CODE_EXECUTION_INVALID_SIGNAL,
          message: ERROR_MESSAGES.CODE_EXECUTION_INVALID_SIGNAL,
        };
      default:
        return null;
    }
  }

  /**
   * Convert WebSocket.Data to string
   */
  private convertWebSocketDataToString(data: WebSocket.Data): string {
    if (typeof data === 'string') {
      return data;
    } else if (Buffer.isBuffer(data)) {
      return data.toString('utf-8');
    } else if (Array.isArray(data)) {
      return Buffer.concat(data).toString('utf-8');
    } else {
      return Buffer.from(data).toString('utf-8');
    }
  }
}
