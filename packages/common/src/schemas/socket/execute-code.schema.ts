import { z } from 'zod';
import { fileIdSchema } from '../entities/file.schema.js';
import { executeCodeResponseSchema } from '../api/code-execution.schema.js';

// 코드 실행 요청 (C -> S)
export const executeCodePayloadSchema = z.object({
  fileId: fileIdSchema,
  language: z.string(),
  stdin: z.string().optional(),
  args: z.array(z.string()).optional(),
  interactive: z.boolean().optional().default(true),
});

// 코드 실행 결과 (S -> C)
export const codeExecutionResultPayloadSchema = executeCodeResponseSchema;

// 코드 실행 에러 (S -> C)
export const codeExecutionErrorPayloadSchema = z.object({
  error: z.string(),
  message: z.string(),
});

// 코드 실행 시작 (S -> C) - Streaming
export const codeExecutionStartedPayloadSchema = z.object({
  language: z.string(),
  version: z.string(),
});

// 코드 실행 단계 변경 (S -> C) - Streaming
export const codeExecutionStagePayloadSchema = z.object({
  stage: z.enum(['compile', 'run']),
});

// 코드 실행 데이터 스트림 (S -> C) - Streaming
export const codeExecutionDataPayloadSchema = z.object({
  stream: z.enum(['stdout', 'stderr']),
  data: z.string(),
});

// 코드 실행 완료 (S -> C) - Streaming
export const codeExecutionCompletedPayloadSchema = z.object({
  stage: z.enum(['compile', 'run']),
  code: z.number().nullable(),
  signal: z.string().nullable(),
});
