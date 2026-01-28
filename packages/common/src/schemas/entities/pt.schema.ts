import { z } from 'zod';
import {
  PT_ROLES,
  UPDATABLE_PT_ROLES,
  EDITABLE_PT_ROLES,
  PT_PRESENCES,
  PT_COLORS,
} from '../../constants/pt.js';
import { MESSAGE } from '../../constants/messages.js';
import { LIMITS } from '../../constants/limits.js';

// 닉네임 스키마: 1-6자, 모든 유니코드 허용
export const nicknameSchema = z
  .string()
  .trim()
  .min(LIMITS.NICKNAME_MIN, MESSAGE.VALIDATION.NICKNAME_REQUIRED)
  .max(LIMITS.NICKNAME_MAX, MESSAGE.VALIDATION.NICKNAME_TOO_LONG);

// 참가자 ID 스키마
export const ptIdSchema = z.uuidv4();

// 참가자 role 스키마
export const ptRoleSchema = z.enum(PT_ROLES);

// 변경 가능한 참가자 role 스키마 (host 제외)
export const updatablePtRoleSchema = z.enum(UPDATABLE_PT_ROLES);

// 파일 편집 가능한 role 스키마 (host, editor만 가능)
export const editablePtRoleSchema = z.enum(EDITABLE_PT_ROLES);

// 참가자 presence 스키마
export const ptPresenceSchema = z.enum(PT_PRESENCES);

// 참가자 해시 스키마 (숫자 4자리)
export const ptHashSchema = z
  .string()
  .regex(
    new RegExp(`^\\d{${LIMITS.PT_HASH_LENGTH}}$`),
    MESSAGE.VALIDATION.PT_HASH_INVALID,
  );

// 참가자 색상 스키마
export const ptColorSchema = z.enum(PT_COLORS);

// 참가자 스키마
export const ptSchema = z.object({
  ptId: ptIdSchema,
  ptHash: ptHashSchema,
  nickname: nicknameSchema,
  role: ptRoleSchema,
  color: ptColorSchema,
  presence: ptPresenceSchema,
  createdAt: z.iso.datetime(),
});
