/**
 * 방 입장 이벤트(`room:join`) 시 전송되는 데이터 페이로드.
 */
export interface JoinRoomPayload {
  /**
   * 입장하려는 방의 고유 ID
   */
  roomId: string;
}

/**
 * 코드 변경 이벤트(`code:update`) 시 전송되는 데이터 페이로드.
 */
export interface CodeUpdatePayload {
  /**
   * 변경사항이 발생한 방의 ID
   */
  roomId: string;

  /**
   * 변경된 코드 내용 (전체 문자열)
   * * @todo 추후 Yjs를 도입하여 CRDT 바이너리(Uint8Array) 형태로 변경해야 함.
   * 현재 단계에서는 단순 string으로 처리.
   */
  code: string;
}
