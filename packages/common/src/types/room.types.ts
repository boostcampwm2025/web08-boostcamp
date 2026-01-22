import type { z } from 'zod';
import {
  roomJoinStatusSchema,
  roomTypeSchema,
  whoCanDestroyRoomSchema,
} from '../schemas/room.schema.js';
import {
  joinRoomPayloadSchema,
  welcomePayloadSchema,
  roomPtsPayloadSchema,
  roomDocPayloadSchema,
  roomAwarenessPayloadSchema,
  roomExpiredPayloadSchema,
} from '../schemas/socket/room-socket.schema.js';

/** 방 타입 */
export type RoomType = z.infer<typeof roomTypeSchema>;

/** 방 폭파 권한 */
export type WhoCanDestroyRoom = z.infer<typeof whoCanDestroyRoomSchema>;

/** 방 참가 가능 여부 상태 */
export type RoomJoinStatus = z.infer<typeof roomJoinStatusSchema>;

/** 방 입장 요청 (C -> S) */
export type JoinRoomPayload = z.infer<typeof joinRoomPayloadSchema>;

/** 입장 환영 메시지 (S -> C) */
export type WelcomePayload = z.infer<typeof welcomePayloadSchema>;

/** 방 참가자 목록 (S -> C) */
export type RoomPtsPayload = z.infer<typeof roomPtsPayloadSchema>;

/** Y.Doc 초기 상태 (S -> C) */
export type RoomDocPayload = z.infer<typeof roomDocPayloadSchema>;

/** Awareness 초기 상태 (S -> C) */
export type RoomAwarenessPayload = z.infer<typeof roomAwarenessPayloadSchema>;

/** 방 만료 알림 (S -> C) */
export type RoomExpiredPayload = z.infer<typeof roomExpiredPayloadSchema>;
