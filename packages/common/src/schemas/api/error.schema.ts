import { z } from 'zod';
import { ERROR_CODE } from '../../constants/errors.js';

// 에러 코드 값들의 배열 추출
const errorCodeValues = Object.values(ERROR_CODE) as [string, ...string[]];

// 에러 응답 스키마
export const errorResponseSchema = z.object({
  code: z.enum(errorCodeValues),
  message: z.string().trim(),
  details: z.unknown().optional(),
  timestamp: z.iso.datetime().optional(),
});
