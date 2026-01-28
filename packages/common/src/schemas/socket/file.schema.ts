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
});

// 코드 실행 결과 (S -> C)
export const codeExecutionResultPayloadSchema = executeCodeResponseSchema;

// 코드 실행 에러 (S -> C)
export const codeExecutionErrorPayloadSchema = z.object({
  error: z.string(),
  message: z.string(),
});
