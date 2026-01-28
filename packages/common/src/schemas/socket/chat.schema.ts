import { z } from 'zod';
import { ptSchema } from '../entities/pt.schema.js';

// 시스템 메시지 (S -> C)
export const chatSystemPayloadSchema = z.object({
  id: z.uuidv7(),
  type: z.enum(['join', 'leave']),
  pt: ptSchema, // 참가자 정보
});
