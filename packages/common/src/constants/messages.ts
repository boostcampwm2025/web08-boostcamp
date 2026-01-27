import { LIMITS } from './limits.js';
import { ERROR_CODE } from './errors.js';

export const ERROR_MESSAGES = {
  ROOM_NOT_FOUND: '방을 찾을 수 없습니다',
  ROOM_FULL: '방이 가득 찼습니다',
  ROOM_EXPIRED: '방이 만료되었습니다',
  INVALID_TOKEN: '유효하지 않은 토큰입니다',
  INVALID_PASSWORD: '비밀번호가 일치하지 않습니다',
  UNAUTHORIZED: '권한이 없습니다',
  INVALID_ROOM_CODE: '올바른 방 코드 형식이 아닙니다',
  PT_NOT_FOUND: '참가자를 찾을 수 없습니다',
  NOT_HOST: '호스트 권한이 필요합니다',
  FILE_NOT_FOUND: '파일을 찾을 수 없습니다',
  INVALID_FILENAME: '유효하지 않은 파일명입니다',
  DUPLICATE_FILENAME: '중복된 파일명입니다',
  TOO_MANY_REQUESTS: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요',
  SERVER_ERROR: '일시적인 서버 오류가 발생했습니다',
} as const;

export const VALIDATION_MESSAGES = {
  NICKNAME_REQUIRED: '닉네임을 입력해주세요.',
  NICKNAME_TOO_LONG: `닉네임은 최대 ${LIMITS.NICKNAME_MAX}자까지 입력 가능합니다.`,
  PASSWORD_REQUIRED: '비밀번호를 입력해주세요',
  PASSWORD_TOO_LONG: `비밀번호는 최대 ${LIMITS.PASSWORD_MAX}자까지 입력 가능합니다.`,
  PASSWORD_FORMAT: '비밀번호는 영문 대소문자와 숫자만 포함해야 합니다',
  ROOM_CODE_LENGTH: `방 코드는 ${LIMITS.ROOM_CODE_LENGTH}자리여야 합니다`,
  ROOM_CODE_FORMAT: '방 코드는 영문 대문자와 숫자만 포함해야 합니다',
  TOKEN_REQUIRED: '토큰이 비어있습니다',
  MAX_PTS_INVALID: '최대 참가자 수는 정수여야 합니다',
  MAX_PTS_MIN: `최대 참가자 수는 최소 ${LIMITS.MIN_PTS}명 이상이어야 합니다`,
  MAX_PTS_MAX: `최대 참가자 수는 ${LIMITS.MAX_PTS}명을 초과할 수 없습니다`,
  FILENAME_REQUIRED: '파일명을 입력해주세요',
  FILENAME_TOO_LONG: `파일명은 최대 ${LIMITS.FILENAME_MAX}자까지 입력 가능합니다`,
  FILENAME_INVALID_CHARS: '파일명에 사용할 수 없는 문자가 포함되어 있습니다',
  FILENAME_ONLY_DOTS: '파일명은 점(.)으로만 구성될 수 없습니다',
  FILENAME_RESERVED: '예약된 파일명은 사용할 수 없습니다',
  FILENAME_INVALID_ENDING: '파일명은 점(.)이나 공백으로 끝날 수 없습니다',
  PT_HASH_INVALID: `참가자 해시는 숫자 ${LIMITS.PT_HASH_LENGTH}자리여야 합니다`,
} as const;

const HOST_CLAIM_FAIL_MESSAGES = {
  [ERROR_CODE.INVALID_PASSWORD]: ERROR_MESSAGES.INVALID_PASSWORD,
  [ERROR_CODE.CLAIM_ALREADY_PENDING]:
    '이미 진행 중인 호스트 권한 요청이 있습니다.',
  [ERROR_CODE.HOST_NOT_FOUND]: '호스트를 찾을 수 없습니다.',
  [ERROR_CODE.ROOM_NOT_FOUND]: ERROR_MESSAGES.ROOM_NOT_FOUND,
} as Record<string, string>;

export const MESSAGE = {
  ERROR: ERROR_MESSAGES,
  VALIDATION: VALIDATION_MESSAGES,
  HOST_CLAIM_FAIL: HOST_CLAIM_FAIL_MESSAGES,
} as const;
