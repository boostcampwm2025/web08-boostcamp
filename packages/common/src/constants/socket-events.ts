export const SOCKET_EVENTS = {
  JOIN_ROOM: 'room:join',
  LEFT_ROOM: 'room:left',
  WELCOME: 'room:welcome',
  GOODBYE: 'room:goodbye',
  ROOM_PTS: 'room:pts',
  ROOM_DOC: 'room:doc',
  ROOM_AWARENESS: 'room:awareness',
  ROOM_EXPIRED: 'room:expired',
  DESTROY_ROOM: 'room:destroy',
  ROOM_DESTROYED: 'room:destroyed',

  PT_JOINED: 'room:pt_joined',
  PT_DISCONNECT: 'room:pt_disconnect',
  PT_LEFT: 'room:pt_left',
  UPDATE_PT: 'pt:update',
  UPDATE_ROLE_PT: 'pt:update_role',
  UPDATE_NICKNAME_PT: 'pt:update_nickname',
  HOST_TRANSFERRED: 'host:transferred',
  CLAIM_HOST: 'host:claim',
  HOST_CLAIM_REQUEST: 'host:claim:request',
  ACCEPT_HOST_CLAIM: 'host:claim:accept',
  REJECT_HOST_CLAIM: 'host:claim:reject',
  HOST_CLAIM_REJECTED: 'host:claim:rejected',
  HOST_CLAIM_CANCELLED: 'host:claim:cancelled',
  HOST_CLAIM_FAILED: 'host:claim:failed',

  UPDATE_FILE: 'file:update',
  UPDATE_AWARENESS: 'awareness:update',

  CHECK_FILENAME: 'file:checkname',

  RENAME_FILE: 'file:rename',
  DELETE_FILE: 'file:delete',

  REQUEST_DOC: 'doc:request',
  REQUEST_AWARENESS: 'awareness:request',

  EXECUTE_CODE: 'code:execute',
  CODE_EXECUTION_RESULT: 'code:execution:result',
  CODE_EXECUTION_ERROR: 'code:execution:error',
} as const;
