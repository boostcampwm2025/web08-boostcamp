import { z } from 'zod';
import {
  passwordSchema,
  roomCodeSchema,
  roomTokenSchema,
  maxPtsSchema,
} from './room.schema.js';

// 커스텀 룸 생성 요청 스키마
export const createCustomRoomSchema = z.object({
  maxPts: maxPtsSchema,
  roomPassword: passwordSchema.optional(),
  hostPassword: passwordSchema.optional(),
});

// 방 생성 응답 스키마
export const createRoomResponseSchema = z.object({
  roomCode: roomCodeSchema,
  token: roomTokenSchema,
});
