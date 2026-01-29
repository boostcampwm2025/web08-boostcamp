import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { CodeExecutionService } from './code-execution.service';
import { ExecuteCodeRequestDto } from './dto/execute-code.dto';
import { ERROR_CODE } from '@codejam/common';

const PISTON_API_URL = 'http://localhost:2000';

const mockConfigService = {
  get: jest.fn().mockReturnValue(PISTON_API_URL),
};

const mockHttpService = {
  post: jest.fn(),
};

describe('CodeExecutionService', () => {
  let service: CodeExecutionService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CodeExecutionService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<CodeExecutionService>(CodeExecutionService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Service가 정의되어야 한다', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('Python 코드를 성공적으로 실행한다', async () => {
      // Arrange
      const dto: ExecuteCodeRequestDto = {
        language: 'python',
        version: '*',
        files: [{ content: 'print("Hello, World!")' }],
      };

      const mockResponse: AxiosResponse = {
        data: {
          language: dto.language,
          version: '3.x',
          run: {
            stdout: 'Hello, World!\n',
            stderr: '',
            output: 'Hello, World!\n',
            code: 0,
            signal: null,
            message: null,
            status: null,
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      // Act
      const result = await service.execute(dto);
      if (!result) return;

      // Assert
      expect(result.language).toBe('python');
      expect(result.run.stdout).toBe('Hello, World!\n');
      expect(result.run.code).toBe(0);
    });

    it('Python 코드에서 입력값을 받아 처리한다', async () => {
      // Arrange
      const dto: ExecuteCodeRequestDto = {
        language: 'python',
        version: '*',
        files: [{ content: 'name = input()\nprint(f"Hello, {name}!")' }],
        stdin: 'Codejam',
      };

      const mockResponse: AxiosResponse = {
        data: {
          language: dto.language,
          version: '3.x',
          run: {
            stdout: 'Hello, Codejam!\n',
            stderr: '',
            output: 'Hello, Codejam!\n',
            code: 0,
            signal: null,
            message: null,
            status: null,
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      // Act
      const result = await service.execute(dto);
      if (!result) return;

      // Assert
      expect(result.run.stdout).toBe('Hello, Codejam!\n');
      expect(result.run.code).toBe(0);
    });

    it('Python 코드 실행 중 오류가 발생하면 stderr에 오류를 반환한다', async () => {
      // Arrange
      const dto: ExecuteCodeRequestDto = {
        language: 'python',
        version: '*',
        files: [{ content: 'print(variable)' }],
      };

      const mockResponse: AxiosResponse = {
        data: {
          language: dto.language,
          version: '3.x',
          run: {
            stdout: '',
            stderr: "NameError: name 'variable' is not defined\n",
            output: "NameError: name 'variable' is not defined\n",
            code: 1,
            signal: null,
            message: null,
            status: null,
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      // Act
      const result = await service.execute(dto);
      if (!result) return;

      // Assert
      expect(result.run.stderr).toBeTruthy();
      expect(result.run.code).not.toBe(0);
    });

    it('여러 파일로 Python 코드를 실행한다', async () => {
      // Arrange
      const dto: ExecuteCodeRequestDto = {
        language: 'python',
        version: '*',
        files: [
          {
            name: 'utils.py',
            content: 'def greet(name):\n    return f"Hello, {name}!"',
          },
          {
            name: 'main.py',
            content: 'from utils import greet\nprint(greet("World"))',
          },
        ],
      };

      const mockResponse: AxiosResponse = {
        data: {
          language: dto.language,
          version: '3.x',
          run: {
            stdout: 'Hello, World!\n',
            stderr: '',
            output: 'Hello, World!\n',
            code: 0,
            signal: null,
            message: null,
            status: null,
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      // Act
      const result = await service.execute(dto);
      if (!result) return;

      // Assert
      expect(result.run.stdout).toBe('Hello, World!\n');
      expect(result.run.code).toBe(0);
    });

    it('Piston API 오류 시 CODE_EXECUTION_FAILED 에러를 던진다', async () => {
      // Arrange
      const dto: ExecuteCodeRequestDto = {
        language: 'python',
        version: '*',
        files: [{ content: 'print("test")' }],
      };

      const axiosError = new AxiosError(
        'Bad Request',
        'ERR_BAD_REQUEST',
        {} as any,
        {},
        {
          status: 400,
          statusText: 'Bad Request',
          data: {},
          headers: {},
          config: {} as any,
        },
      );

      mockHttpService.post.mockReturnValue(throwError(() => axiosError));

      // Act + Assert
      await expect(service.execute(dto)).rejects.toThrow();
      try {
        await service.execute(dto);
      } catch (error) {
        expect(error.code).toBe(ERROR_CODE.CODE_EXECUTION_FAILED);
      }
    });

    it('네트워크 오류 시 CODE_EXECUTION_SERVICE_UNAVAILABLE 에러를 던진다', async () => {
      // Arrange
      const dto: ExecuteCodeRequestDto = {
        language: 'python',
        version: '*',
        files: [{ content: 'print("test")' }],
      };

      const networkError = new AxiosError(
        'Network Error',
        'ERR_NETWORK',
        {} as any,
        {},
        undefined,
      );

      mockHttpService.post.mockReturnValue(throwError(() => networkError));

      // Act + Assert
      await expect(service.execute(dto)).rejects.toThrow();
      try {
        await service.execute(dto);
      } catch (error) {
        expect(error.code).toBe(ERROR_CODE.CODE_EXECUTION_SERVICE_UNAVAILABLE);
      }
    });

    it('알 수 없는 오류 시 CODE_EXECUTION_FAILED 에러를 던진다', async () => {
      // Arrange
      const dto: ExecuteCodeRequestDto = {
        language: 'python',
        version: '*',
        files: [{ content: 'print("test")' }],
      };

      const unknownError = new Error('Unknown error');

      mockHttpService.post.mockReturnValue(throwError(() => unknownError));

      // Act + Assert
      await expect(service.execute(dto)).rejects.toThrow();
      try {
        await service.execute(dto);
      } catch (error) {
        expect(error.code).toBe(ERROR_CODE.CODE_EXECUTION_FAILED);
      }
    });
  });
});
