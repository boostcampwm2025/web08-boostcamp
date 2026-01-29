import { z } from 'zod';
import { ptSchema } from '../entities/pt.schema.js';
import { LIMITS } from '../../constants/limits.js';

// 시스템 메시지 (S -> C)
export const chatSystemPayloadSchema = z.object({
  id: z.uuidv7(),
  type: z.enum(['join', 'leave']),
  pt: ptSchema, // 참가자 정보
});

// 사용자 채팅 메시지 전송 (C -> S)
export const chatMessageSendSchema = z.object({
  content: z
    .string()
    .trim()
    .min(LIMITS.CHAT_MESSAGE_MIN)
    .max(LIMITS.CHAT_MESSAGE_MAX),
});

// 사용자 채팅 메시지 브로드캐스트 (S -> C)
export const chatMessagePayloadSchema = z.object({
  id: z.uuidv7(),
  pt: ptSchema,
  content: z.string(),
  createdAt: z.iso.datetime(),
});
