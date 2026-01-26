import { z } from 'zod';
import {
  ptSchema,
  updatablePtRoleSchema,
  ptIdSchema,
  nicknameSchema,
} from '../entities/pt.schema.js';
import { passwordSchema } from '../entities/room.schema.js';

// 새 참가자 입장 알림 (S -> C)
export const ptJoinedPayloadSchema = z.object({
  pt: ptSchema,
});

// 참가자 연결 끊김 알림 (S -> C)
export const ptDisconnectPayloadSchema = z.object({
  ptId: ptIdSchema,
});

// 참가자 퇴장 알림 (S -> C)
export const ptLeftPayloadSchema = z.object({
  ptId: ptIdSchema,
});

// 참가자 정보 변경 (S -> C)
export const ptUpdatePayloadSchema = z.object({
  pt: ptSchema,
});

// 참가자 권한 업데이트 (C <-> S)
export const ptUpdateRolePayloadSchema = z.object({
  ptId: ptIdSchema,
  role: updatablePtRoleSchema,
});

// 참가자 닉네임 업데이트 (C <-> S)
export const ptUpdateNamePayloadSchema = z.object({
  ptId: ptIdSchema,
  nickname: nicknameSchema,
});

// 호스트 권한 요청 (C -> S)
export const claimHostPayloadSchema = z.object({
  hostPassword: passwordSchema,
});
