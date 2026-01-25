import type { z } from 'zod';
import {
  // Room socket schemas
  joinRoomPayloadSchema,
  welcomePayloadSchema,
  roomPtsPayloadSchema,
  roomDocPayloadSchema,
  roomAwarenessPayloadSchema,
  roomExpiredPayloadSchema,
  // Pt socket schemas
  ptJoinedPayloadSchema,
  ptDisconnectPayloadSchema,
  ptLeftPayloadSchema,
  ptUpdatePayloadSchema,
  ptUpdateRolePayloadSchema,
  ptUpdateNamePayloadSchema,
  claimHostPayloadSchema,
  // File socket schemas
  fileUpdatePayloadSchema,
  awarenessUpdatePayloadSchema,
  filenameCheckPayloadSchema,
  fileRenamePayloadSchema,
  fileDeletePayloadSchema,
  filenameCheckResultPayloadSchema,
} from '../schemas/socket/index.js';

// ==================== Room Socket Types ====================

/** 방 입장 요청 (C -> S) */
export type JoinRoomPayload = z.infer<typeof joinRoomPayloadSchema>;

/** 입장 환영 메시지 (S -> C) */
export type WelcomePayload = z.infer<typeof welcomePayloadSchema>;

/** 방 참가자 목록 (S -> C) */
export type RoomPtsPayload = z.infer<typeof roomPtsPayloadSchema>;

/** Y.Doc 초기 상태 (S -> C) */
export type RoomDocPayload = z.infer<typeof roomDocPayloadSchema>;

/** Awareness 초기 상태 (S -> C) */
export type RoomAwarenessPayload = z.infer<typeof roomAwarenessPayloadSchema>;

/** 방 만료 알림 (S -> C) */
export type RoomExpiredPayload = z.infer<typeof roomExpiredPayloadSchema>;

// ==================== Participant Socket Types ====================

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

/** 호스트 권한 요청 (C -> S) */
export type ClaimHostPayload = z.infer<typeof claimHostPayloadSchema>;

// ==================== File Socket Types ====================

/** 파일 내용 변경 (C <-> S) */
export type FileUpdatePayload = z.infer<typeof fileUpdatePayloadSchema>;

/** Awareness 업데이트 (C <-> S) */
export type AwarenessUpdatePayload = z.infer<
  typeof awarenessUpdatePayloadSchema
>;

/** 파일 이름 확인 (C -> S) */
export type FilenameCheckPayload = z.infer<typeof filenameCheckPayloadSchema>;

/** 파일 이름 변경 (C -> S) */
export type FileRenamePayload = z.infer<typeof fileRenamePayloadSchema>;

/** 파일 삭제 요청 (C -> S) */
export type FileDeletePayload = z.infer<typeof fileDeletePayloadSchema>;

/** 파일 이름 확인 (S -> C) */
export type FilenameCheckResultPayload = z.infer<
  typeof filenameCheckResultPayloadSchema
>;
