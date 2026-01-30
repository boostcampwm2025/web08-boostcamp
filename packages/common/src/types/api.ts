import type { z } from 'zod';
import {
  createCustomRoomRequestSchema,
  createQuickRoomResponseSchema,
  createCustomRoomResponseSchema,
  checkRoomJoinableResponseSchema,
  errorResponseSchema,
} from '../schemas/api/index.js';

/** 커스텀 룸 생성 요청 */
export type CreateCustomRoomRequest = z.infer<
  typeof createCustomRoomRequestSchema
>;

/** Quick Room 생성 응답 */
export type CreateQuickRoomResponse = z.infer<
  typeof createQuickRoomResponseSchema
>;

/** Custom Room 생성 응답 */
export type CreateCustomRoomResponse = z.infer<
  typeof createCustomRoomResponseSchema
>;

/** 방 참가 가능 여부 확인 응답 */
export type CheckRoomJoinableResponse = z.infer<
  typeof checkRoomJoinableResponseSchema
>;

/** 에러 응답 */
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
