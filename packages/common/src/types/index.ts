export interface Pt {
  ptId: string;
  nickname: string;
  role: "host" | "editor" | "viewer";
  color: string;
  presence: "online" | "offline";
  createdAt: string;
}

/** 방 입장 요청 (C -> S) */
export interface JoinRoomPayload {
  roomCode: string;
  ptId?: string;
  nickname?: string;
}

/** 파일 내용 변경 (C -> S) */
export interface FileUpdatePayload {
  message: Uint8Array;
}

/** Awareness 업데이트 (C -> S) */
export interface AwarenessUpdatePayload {
  message: Uint8Array;
}

/** 입장 환영 메시지 (S -> C) */
export interface WelcomePayload {
  myPtId: string;
}

/** 방 참가자 목록 (S -> C) */
export interface RoomPtsPayload {
  roomId: string;
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

/** 새 참가자 입장 알림 (S -> C) */
export interface PtJoinedPayload {
  pt: Pt;
}

/** 참가자 연결 끊김 알림 (S -> C) */
export interface PtDisconnectPayload {
  ptId: string;
}

/** 참가자 퇴장 알림 (S -> C) */
export interface PtLeftPayload {
  ptId: string;
}

/** 참가자 정보 변경 (S -> C) */
export interface PtUpdatePayload {
  pt: Pt;
}

/** 방 만료 알림 (S -> C) */
export interface RoomExpiredPayload {
  message?: string;
}
