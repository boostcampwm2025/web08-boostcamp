import { z } from 'zod';

// 닉네임 스키마: 1-6자, 모든 유니코드 허용
export const nicknameSchema = z
  .string()
  .min(1, '닉네임을 입력해주세요.')
  .max(6, '닉네임은 최대 6자까지 입력 가능합니다.');

// 참가자 ID 스키마
export const ptIdSchema = z.string();

// 참가자 role 스키마
export const ptRoleSchema = z.enum(['host', 'editor', 'viewer']);

// 변경 가능한 참가자 role 스키마 (host 제외)
export const updatablePtRoleSchema = z.enum(['editor', 'viewer']);

// 참가자 presence 스키마
export const ptPresenceSchema = z.enum(['online', 'offline']);

// 참가자 스키마
export const ptSchema = z.object({
  ptId: ptIdSchema,
  ptHash: z.string(),
  nickname: nicknameSchema,
  role: ptRoleSchema,
  color: z.string(),
  presence: ptPresenceSchema,
  createdAt: z.string(),
});
