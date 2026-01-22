import { z } from 'zod';

// 비밀번호 스키마: 1-16자, 알파벳 대소문자와 숫자만 허용
export const passwordSchema = z
  .string()
  .min(1, '비밀번호를 입력해주세요')
  .max(16, '비밀번호는 최대 16자까지 입력 가능합니다.')
  .regex(/^[a-zA-Z0-9]+$/, '비밀번호는 영문 대소문자와 숫자만 포함해야 합니다');

// 방 코드 스키마
export const roomCodeSchema = z
  .string()
  .length(6, '방 코드는 6자리여야 합니다')
  .regex(/^[0-9A-Z]+$/, '방 코드는 영문 대문자와 숫자만 포함해야 합니다');

// 토큰 스키마
export const roomTokenSchema = z.string().min(1, '토큰이 비어있습니다');

// 방 타입 스키마
export const roomTypeSchema = z.enum(['quick', 'custom']);

// 방 폭파 권한 스키마
export const whoCanDestroyRoomSchema = z.enum(['host', 'editor']);

// 방 참가 가능 여부 상태 스키마
export const roomJoinStatusSchema = z.enum(['JOINABLE', 'FULL', 'NOT_FOUND']);

// 최대 참가자 수 스키마
export const maxPtsSchema = z
  .coerce.number()
  .int('최대 참가자 수는 정수여야 합니다')
  .min(1, '최대 참가자 수는 최소 1명 이상이어야 합니다')
  .max(150, '최대 참가자 수는 150명을 초과할 수 없습니다');
