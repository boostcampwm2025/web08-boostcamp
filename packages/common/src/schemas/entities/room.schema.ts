import { z } from 'zod';
import { MESSAGE } from '../../constants/messages.js';
import { LIMITS } from '../../constants/limits.js';
import {
  ROOM_TYPE,
  WHO_CAN_DESTROY_ROOM,
  DEFAULT_ROLE,
  ROOM_JOIN_STATUS,
} from '../../constants/room.js';

// 비밀번호 스키마: 1-16자, 알파벳 대소문자와 숫자만 허용
export const passwordSchema = z
  .string()
  .trim()
  .min(LIMITS.PASSWORD_MIN, MESSAGE.VALIDATION.PASSWORD_REQUIRED)
  .max(LIMITS.PASSWORD_MAX, MESSAGE.VALIDATION.PASSWORD_TOO_LONG)
  .regex(/^[a-zA-Z0-9]+$/, MESSAGE.VALIDATION.PASSWORD_FORMAT);

// 방 코드 스키마
export const roomCodeSchema = z
  .string()
  .length(LIMITS.ROOM_CODE_LENGTH, MESSAGE.VALIDATION.ROOM_CODE_LENGTH)
  .regex(/^[0-9A-Z]+$/, MESSAGE.VALIDATION.ROOM_CODE_FORMAT);

// 토큰 스키마
export const roomTokenSchema = z.jwt();

// 방 타입 스키마
export const roomTypeSchema = z.enum(
  Object.values(ROOM_TYPE) as [string, ...string[]],
);

// 방 폭파 권한 스키마
export const whoCanDestroyRoomSchema = z.enum(
  Object.values(WHO_CAN_DESTROY_ROOM) as [string, ...string[]],
);

// 기본 입장 권한 설정 정책 스키마
export const defaultRolePolicySchema = z.enum(
  Object.values(DEFAULT_ROLE) as [string, ...string[]],
);

// 방 참가 가능 여부 상태 스키마
export const roomJoinStatusSchema = z.enum(
  Object.values(ROOM_JOIN_STATUS) as [string, ...string[]],
);

// 최대 참가자 수 스키마
export const maxPtsSchema = z.coerce
  .number()
  .int(MESSAGE.VALIDATION.MAX_PTS_INVALID)
  .min(LIMITS.MIN_PTS, MESSAGE.VALIDATION.MAX_PTS_MIN)
  .max(LIMITS.MAX_PTS, MESSAGE.VALIDATION.MAX_PTS_MAX);
