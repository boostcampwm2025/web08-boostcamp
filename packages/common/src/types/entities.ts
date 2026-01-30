import type { z } from 'zod';
import {
  // Pt schemas
  ptSchema,
  ptIdSchema,
  nicknameSchema,
  ptRoleSchema,
  updatablePtRoleSchema,
  ptPresenceSchema,
  ptColorSchema,
  ptHashSchema,
  // Room schemas
  roomCodeSchema,
  roomTokenSchema,
  passwordSchema,
  roomTypeSchema,
  whoCanDestroyRoomSchema,
  defaultRolePolicySchema,
  roomJoinStatusSchema,
  maxPtsSchema,
  // Auth schemas
  roomTokenPayloadSchema,
  // File schemas
  fileIdSchema,
  filenameSchema,
  filenameCheckResultTypeSchema,
  languageSchema,
  extTypeSchema,
} from '../schemas/entities/index.js';

// ==================== Participant Types ====================

/** 참가자 */
export type Pt = z.infer<typeof ptSchema>;

/** 참가자 ID */
export type PtId = z.infer<typeof ptIdSchema>;

/** 닉네임 */
export type Nickname = z.infer<typeof nicknameSchema>;

/** 참가자 role */
export type PtRole = z.infer<typeof ptRoleSchema>;

/** 변경 가능한 참가자 role (host 제외) */
export type UpdatablePtRole = z.infer<typeof updatablePtRoleSchema>;

/** 참가자 presence */
export type PtPresence = z.infer<typeof ptPresenceSchema>;

/** 참가자 색상 */
export type PtColor = z.infer<typeof ptColorSchema>;

/** 참가자 해시 */
export type PtHash = z.infer<typeof ptHashSchema>;

// ==================== Room Types ====================

/** 방 코드 */
export type RoomCode = z.infer<typeof roomCodeSchema>;

/** 방 토큰 */
export type RoomToken = z.infer<typeof roomTokenSchema>;

/** 비밀번호 */
export type Password = z.infer<typeof passwordSchema>;

/** 방 타입 */
export type RoomType = z.infer<typeof roomTypeSchema>;

/** 방 폭파 권한 */
export type WhoCanDestroyRoom = z.infer<typeof whoCanDestroyRoomSchema>;

/** 기본 입장 권한 설정 정책 */
export type DefaultRolePolicy = z.infer<typeof defaultRolePolicySchema>;

/** 방 참가 가능 여부 상태 */
export type RoomJoinStatus = z.infer<typeof roomJoinStatusSchema>;

/** 최대 참가자 수 */
export type MaxPts = z.infer<typeof maxPtsSchema>;

// ==================== Auth Types ====================

/** RoomToken 페이로드 */
export type RoomTokenPayload = z.infer<typeof roomTokenPayloadSchema>;

// ==================== File Types ====================

/** 파일 ID */
export type FileId = z.infer<typeof fileIdSchema>;

/** 파일명 */
export type Filename = z.infer<typeof filenameSchema>;

/** 파일 이름 확인 결과 타입 */
export type FilenameCheckResultType = z.infer<
  typeof filenameCheckResultTypeSchema
>;

/** 프로그래밍 언어 타입 */
export type Language = z.infer<typeof languageSchema>;

/** 파일 확장자 타입 */
export type ExtType = z.infer<typeof extTypeSchema> | undefined;
