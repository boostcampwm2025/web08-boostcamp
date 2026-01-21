export const SOCKET_EVENTS = {
  JOIN_ROOM: "room:join",
  WELCOME: "room:welcome",
  ROOM_PTS: "room:pts",
  ROOM_DOC: "room:doc",
  ROOM_AWARENESS: "room:awareness",
  ROOM_EXPIRED: "room:expired",
  DESTROY_ROOM: "room:destroy",
  ROOM_DESTROYED: "room:destroyed",

  PT_JOINED: "room:pt_joined",
  PT_DISCONNECT: "room:pt_disconnect",
  PT_LEFT: "room:pt_left",
  UPDATE_PT: "pt:update",

  UPDATE_FILE: "file:update",
  UPDATE_AWARENESS: "awareness:update",

  CHECK_FILENAME: "file:checkname",
  
  RENAME_FILE: "file:rename",
  DELETE_FILE: "file:delete",

  REQUEST_DOC: "doc:request",
  REQUEST_AWARENESS: "awareness:request",
} as const;
