import { z } from 'zod';
import {
  passwordSchema,
  roomCodeSchema,
  roomTokenSchema,
} from './room.schema.js';

// 커스텀 룸 생성 요청 스키마
export const createCustomRoomSchema = z.object({
  maxPts: z
    .number()
    .int('최대 참가자 수는 정수여야 합니다')
    .min(1, '최대 참가자 수는 최소 1명 이상이어야 합니다')
    .max(150, '최대 참가자 수는 150명을 초과할 수 없습니다'),
  roomPassword: passwordSchema.optional(),
  hostPassword: passwordSchema.optional(),
});

// 방 생성 응답 스키마
export const createRoomResponseSchema = z.object({
  roomCode: roomCodeSchema,
  token: roomTokenSchema,
});
