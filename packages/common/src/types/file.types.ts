/** 파일 내용 변경 (C <-> S) */
export interface FileUpdatePayload {
  message: Uint8Array;
}

/** Awareness 업데이트 (C <-> S) */
export interface AwarenessUpdatePayload {
  message: Uint8Array;
}
