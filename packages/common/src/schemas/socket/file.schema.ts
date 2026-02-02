import { z } from 'zod';

// 파일 내용 변경 (C <-> S)
export const fileUpdatePayloadSchema = z.object({
  message: z.instanceof(Uint8Array),
});

// Awareness 업데이트 (C <-> S)
export const awarenessUpdatePayloadSchema = z.object({
  message: z.instanceof(Uint8Array),
});
