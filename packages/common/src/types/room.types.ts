import type { Pt } from "./pt.types.js";

/** 방 입장 요청 (C -> S) */
export interface JoinRoomPayload {
  roomCode: string;
  token?: string;
  nickname?: string;
  password?: string;
}

/** 입장 환영 메시지 (S -> C) */
export interface WelcomePayload {
  myPtId: string;
  token: string;
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
