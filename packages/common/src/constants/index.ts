/**
 * 소켓 이벤트 상수
 */
export const SOCKET_EVENTS = {
  // 방 관련
  JOIN_ROOM: "room:join",
  WELCOME: "room:welcome",
  ROOM_PTS: "room:pts",
  ROOM_DOC: "room:doc",
  ROOM_AWARENESS: "room:awareness",

  // 참가자 관련
  PT_JOINED: "room:pt_joined",
  PT_DISCONNECT: "room:pt_disconnect",
  PT_LEFT: "room:pt_left",
  UPDATE_PT: "pt:update",

  // 파일 & Awareness
  UPDATE_FILE: "file:update",
  UPDATE_AWARENESS: "awareness:update",
  REQUEST_DOC: "doc:request",
  REQUEST_AWARENESS: "awareness:request",
} as const;
