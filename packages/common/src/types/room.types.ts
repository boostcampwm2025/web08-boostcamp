import type { Pt } from "./pt.types.js";

/** 방 타입 */
export type RoomType = 'quick' | 'custom';

/** 방 폭파 권한 */
export type WhoCanDestroyRoom = 'host' | 'editor';

/** 방 입장 요청 (C -> S) */
export interface JoinRoomPayload {
  roomCode: string;
  token?: string;
  nickname?: string;
}

/** 입장 환영 메시지 (S -> C) */
export interface WelcomePayload {
  myPtId: string;
  token: string;
  roomType: RoomType;
  whoCanDestroyRoom: WhoCanDestroyRoom;
}

/** 방 참가자 목록 (S -> C) */
export interface RoomPtsPayload {
  pts: Pt[];
}

/** Y.Doc 초기 상태 (S -> C) */
export interface RoomDocPayload {
  message: Uint8Array;
}

/** Awareness 초기 상태 (S -> C) */
export interface RoomAwarenessPayload {
  message: Uint8Array;
}

/** 방 만료 알림 (S -> C) */
export interface RoomExpiredPayload {
  message?: string;
}
