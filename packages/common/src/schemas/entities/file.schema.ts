import { z } from 'zod';
import { LANGUAGES, FILE_TYPES, EXT_TYPES } from '../../constants/file.js';
import { LIMITS } from '../../constants/limits.js';
import { MESSAGE } from '../../constants/messages.js';

// 파일 ID 스키마
export const fileIdSchema = z.uuidv7();

// 파일명 스키마
export const filenameSchema = z
  .string()
  .trim()
  .min(LIMITS.FILENAME_MIN, MESSAGE.VALIDATION.FILENAME_REQUIRED)
  .max(LIMITS.FILENAME_MAX, MESSAGE.VALIDATION.FILENAME_TOO_LONG)
  .regex(/^[^<>:"/\\|?*\x00-\x1F]+$/, MESSAGE.VALIDATION.FILENAME_INVALID_CHARS)
  .regex(/^(?!\.+$)/, MESSAGE.VALIDATION.FILENAME_ONLY_DOTS)
  .regex(
    /^(?!(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$))/i,
    MESSAGE.VALIDATION.FILENAME_RESERVED,
  )
  .refine((name) => !name.endsWith('.') && !name.endsWith(' '), {
    message: MESSAGE.VALIDATION.FILENAME_INVALID_ENDING,
  });

// 파일 타입 스키마
export const fileTypeSchema = z.enum(FILE_TYPES);

// 프로그래밍 언어 스키마
export const languageSchema = z.enum(LANGUAGES);

// 파일 확장자 스키마
export const extTypeSchema = z.enum(EXT_TYPES);
