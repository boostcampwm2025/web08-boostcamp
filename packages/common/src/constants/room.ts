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
