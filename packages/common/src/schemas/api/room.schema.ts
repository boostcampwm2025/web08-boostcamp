import { z } from 'zod';
import {
  passwordSchema,
  roomCodeSchema,
  roomTokenSchema,
  maxPtsSchema,
  roomJoinStatusSchema,
} from '../entities/room.schema.js';

// 커스텀 룸 생성 요청 스키마
export const createCustomRoomRequestSchema = z.object({
  maxPts: maxPtsSchema,
  roomPassword: passwordSchema.optional(),
  hostPassword: passwordSchema.optional(),
});

// Quick Room 생성 응답 스키마 (token 없음)
export const createQuickRoomResponseSchema = z.object({
  roomCode: roomCodeSchema,
});

// Custom Room 생성 응답 스키마 (token 필수)
export const createCustomRoomResponseSchema = z.object({
  roomCode: roomCodeSchema,
  token: roomTokenSchema,
});

// 방 참가 가능 여부 확인 응답 스키마
export const checkRoomJoinableResponseSchema = roomJoinStatusSchema;
