/** 파일 내용 변경 (C <-> S) */
export interface FileUpdatePayload {
  message: Uint8Array;
}

/** Awareness 업데이트 (C <-> S) */
export interface AwarenessUpdatePayload {
  message: Uint8Array;
}

/** 파일 이름 확인 (C -> S) */
export interface FilenameCheckPayload {
  roomCode: string;
  filename: string;
}

/** 파일 이름 확인 (S -> C) */
export interface FilenameCheckResultPayload {
  error: boolean;
  type?: "ext" | "duplicate" | "no_room";
  message?: string; 
}