import { z } from 'zod';
import { roomCodeSchema } from '../room.schema.js';

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
  filename: z.string(),
});

// 파일 이름 변경 (C -> S)
export const fileRenamePayloadSchema = z.object({
  fileId: z.string(),
  newName: z.string(),
});

// 파일 삭제 요청 (C -> S)
export const fileDeletePayloadSchema = z.object({
  fileId: z.string(),
});

// 파일 이름 확인 결과 타입 스키마
export const filenameCheckResultTypeSchema = z.enum(['ext', 'duplicate', 'no_room']);

// 파일 이름 확인 (S -> C)
export const filenameCheckResultPayloadSchema = z.object({
  error: z.boolean(),
  type: filenameCheckResultTypeSchema.optional(),
  message: z.string().optional(),
});
