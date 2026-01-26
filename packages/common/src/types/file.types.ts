import type { z } from 'zod';
import {
  fileUpdatePayloadSchema,
  awarenessUpdatePayloadSchema,
  filenameCheckPayloadSchema,
  fileRenamePayloadSchema,
  fileDeletePayloadSchema,
  filenameCheckResultPayloadSchema,
  filenameCheckResultTypeSchema,
} from '../schemas/socket/file-socket.schema.js';

/** 파일 내용 변경 (C <-> S) */
export type FileUpdatePayload = z.infer<typeof fileUpdatePayloadSchema>;

/** Awareness 업데이트 (C <-> S) */
export type AwarenessUpdatePayload = z.infer<
  typeof awarenessUpdatePayloadSchema
>;

/** 파일 이름 확인 (C -> S) */
export type FilenameCheckPayload = z.infer<typeof filenameCheckPayloadSchema>;

/** 파일 이름 변경 (C -> S) */
export type FileRenamePayload = z.infer<typeof fileRenamePayloadSchema>;

/** 파일 삭제 요청 (C -> S) */
export type FileDeletePayload = z.infer<typeof fileDeletePayloadSchema>;

/** 파일 이름 확인 결과 타입 */
export type FilenameCheckResultType = z.infer<
  typeof filenameCheckResultTypeSchema
>;

/** 파일 이름 확인 (S -> C) */
export type FilenameCheckResultPayload = z.infer<
  typeof filenameCheckResultPayloadSchema
>;
