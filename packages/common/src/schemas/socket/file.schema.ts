import { z } from 'zod';
import { roomCodeSchema } from '../entities/room.schema.js';
import {
  fileIdSchema,
  filenameSchema,
  filenameCheckResultTypeSchema,
} from '../entities/file.schema.js';
import { executeCodeResponseSchema } from '../api/code-execution.schema.js';

// 파일 내용 변경 (C <-> S)
export const fileUpdatePayloadSchema = z.object({
  message: z.instanceof(Uint8Array),
});

// Awareness 업데이트 (C <-> S)
export const awarenessUpdatePayloadSchema = z.object({
  message: z.instanceof(Uint8Array),
});

// 파일 이름 확인 (C -> S)
export const filenameCheckPayloadSchema = z.object({
  roomCode: roomCodeSchema,
  filename: filenameSchema,
});

// 파일 이름 변경 (C -> S)
export const fileRenamePayloadSchema = z.object({
  fileId: fileIdSchema,
  newName: filenameSchema,
});

// 파일 삭제 요청 (C -> S)
export const fileDeletePayloadSchema = z.object({
  fileId: fileIdSchema,
});

// 파일 이름 확인 (S -> C)
export const filenameCheckResultPayloadSchema = z.object({
  error: z.boolean(),
  type: filenameCheckResultTypeSchema.optional(),
  message: z.string().trim().optional(),
});

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
