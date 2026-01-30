import type {
  ERROR_CODE,
  HTTP_STATUS,
  SOCKET_EVENTS,
} from '../constants/index.js';

/** 에러 코드 */
export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];

/** HTTP 상태 코드 */
export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

/** 소켓 이벤트 */
export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

/** API 에러 */
export interface ApiError extends Error {
  code: ErrorCode;
  statusCode?: HttpStatus;
  details?: unknown;
}

/** Nullable 타입 */
export type Nullable<T> = T | null;

/** Optional 타입 */
export type Optional<T> = T | undefined;

/** Y.js Awareness 업데이트 */
export type AwarenessUpdate = {
  added: number[];
  updated: number[];
  removed: number[];
};
