/**
 * 참가자 정보
 */
export interface Pt {
  ptId: string;
  nickname: string;
  role: "host" | "editor" | "viewer";
  color: string;
  presence: "online" | "offline";
  createdAt: string;
}

/**
 * 방 입장 요청
 * Client -> Server
 */
export interface JoinRoomPayload {
  roomCode: string;
  ptId?: string; // 재접속 시 전달
}

/**
 * 환영 메시지
 * Server -> Client
 */
export interface WelcomePayload {
  myPtId: string;
}

/**
 * 참가자 목록
 * Server -> Client
 */
export interface RoomPtsPayload {
  pts: Pt[];
}

/**
 * 문서 상태
 * Server -> Client
 */
export interface RoomDocPayload {
  message: Uint8Array;
}

/**
 * Awareness 상태
 * Server -> Client
 */
export interface RoomAwarenessPayload {
  message: Uint8Array;
}

/**
 * 참가자 정보 업데이트
 * Server -> Client (Broadcast)
 */
export interface PtUpdatePayload {
  pt: Pt;
}

/**
 * 파일 변경
 * Client <-> Server
 */
export interface FileUpdatePayload {
  message: Uint8Array;
}

/**
 * Awareness 업데이트
 * Client <-> Server
 */
export interface AwarenessUpdatePayload {
  message: Uint8Array;
}

/**
 * 참가자 입장
 * Server -> Client (Broadcast)
 */
export interface PtJoinedPayload {
  pt: Pt;
}

/**
 * 참가자 연결 끊김
 * Server -> Client (Broadcast)
 */
export interface PtDisconnectPayload {
  ptId: string;
}

/**
 * 참가자 퇴장 (TTL 만료)
 * Server -> Client (Broadcast)
 */
export interface PtLeftPayload {
  ptId: string;
}
