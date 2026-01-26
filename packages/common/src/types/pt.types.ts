import type { z } from 'zod';
import {
  ptSchema,
  ptRoleSchema,
  ptPresenceSchema,
} from '../schemas/pt.schema.js';
import {
  ptJoinedPayloadSchema,
  ptDisconnectPayloadSchema,
  ptLeftPayloadSchema,
  ptUpdatePayloadSchema,
  ptUpdateRolePayloadSchema,
  ptUpdateNamePayloadSchema,
} from '../schemas/socket/pt-socket.schema.js';

/** 참가자 */
export type Pt = z.infer<typeof ptSchema>;

/** 참가자 role */
export type PtRole = z.infer<typeof ptRoleSchema>;

/** 참가자 presence */
export type PtPresence = z.infer<typeof ptPresenceSchema>;

/** 새 참가자 입장 알림 (S -> C) */
export type PtJoinedPayload = z.infer<typeof ptJoinedPayloadSchema>;

/** 참가자 연결 끊김 알림 (S -> C) */
export type PtDisconnectPayload = z.infer<typeof ptDisconnectPayloadSchema>;

/** 참가자 퇴장 알림 (S -> C) */
export type PtLeftPayload = z.infer<typeof ptLeftPayloadSchema>;

/** 참가자 정보 변경 (S -> C) */
export type PtUpdatePayload = z.infer<typeof ptUpdatePayloadSchema>;

/** 참가자 권한 업데이트 (C <-> S) */
export type PtUpdateRolePayload = z.infer<typeof ptUpdateRolePayloadSchema>;

/** 참가자 닉네임 업데이트 (C <-> S) */
export type PtUpdateNamePayload = z.infer<typeof ptUpdateNamePayloadSchema>;
