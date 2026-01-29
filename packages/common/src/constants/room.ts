import { ROLE } from './pt.js';

// 방 타입
export const ROOM_TYPE = {
  QUICK: 'quick',
  CUSTOM: 'custom',
} as const;

// 방 타입별 폭파 가능 권한
export const WHO_CAN_DESTROY_ROOM = {
  [ROOM_TYPE.QUICK]: ROLE.EDITOR,
  [ROOM_TYPE.CUSTOM]: ROLE.HOST,
} as const;

// 방 타입별 기본 입장 권한
export const DEFAULT_ROLE = {
  [ROOM_TYPE.QUICK]: ROLE.EDITOR,
  [ROOM_TYPE.CUSTOM]: ROLE.VIEWER,
} as const;

// 방 참가 가능 여부 상태
export const ROOM_JOIN_STATUS = {
  JOINABLE: 'JOINABLE',
  FULL: 'FULL',
  NOT_FOUND: 'NOT_FOUND',
} as const;

export const ROOM_CONFIG = {
  EXPIRATION_MS: 24 * 60 * 60 * 1000, // 1일
  COOKIE_MAX_AGE: 24 * 60 * 60 * 1000, // 1일
  MAX_RETRIES: 3,
  QUICK_ROOM_MAX_PTS: 6,
  MAX_ROOMS: 100,
};

export const DEFAULT_HOST = {
  NICKNAME: 'Host',
  COLOR: '#E0E0E0',
};
