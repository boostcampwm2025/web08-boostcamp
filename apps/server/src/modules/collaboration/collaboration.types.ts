import { DefaultEventsMap, Socket } from 'socket.io';
import { PtRole } from '../pt/pt.entity';
import { RoomType } from '../room/room.entity';
import {
  SOCKET_EVENTS,
  type JoinRoomPayload,
  type FileUpdatePayload,
  type AwarenessUpdatePayload,
  type WelcomePayload,
  type RoomPtsPayload,
  type RoomDocPayload,
  type RoomAwarenessPayload,
  type PtUpdatePayload,
  type PtJoinedPayload,
  type PtDisconnectPayload,
  type PtLeftPayload,
} from '@codejam/common';

export interface SocketData {
  roomId: number;
  roomCode: string;
  roomType: RoomType;
  docId: string;
  ptId: string;
  role: PtRole;
  nickname?: string;
  color?: string;
  createdAt?: string;
}

// Client -> Server 이벤트
export interface ClientToServerEvents {
  [SOCKET_EVENTS.JOIN_ROOM]: (payload: JoinRoomPayload) => void;
  [SOCKET_EVENTS.LEFT_ROOM]: () => void;
  [SOCKET_EVENTS.REQUEST_DOC]: () => void;
  [SOCKET_EVENTS.REQUEST_AWARENESS]: () => void;
  [SOCKET_EVENTS.UPDATE_FILE]: (payload: FileUpdatePayload) => void;
  [SOCKET_EVENTS.UPDATE_AWARENESS]: (payload: AwarenessUpdatePayload) => void;
}

// Server -> Client 이벤트
export interface ServerToClientEvents {
  [SOCKET_EVENTS.WELCOME]: (payload: WelcomePayload) => void;
  [SOCKET_EVENTS.GOODBYE]: () => void;
  [SOCKET_EVENTS.ROOM_PTS]: (payload: RoomPtsPayload) => void;
  [SOCKET_EVENTS.ROOM_DOC]: (payload: RoomDocPayload) => void;
  [SOCKET_EVENTS.ROOM_AWARENESS]: (payload: RoomAwarenessPayload) => void;
  [SOCKET_EVENTS.PT_JOINED]: (payload: PtJoinedPayload) => void;
  [SOCKET_EVENTS.PT_DISCONNECT]: (payload: PtDisconnectPayload) => void;
  [SOCKET_EVENTS.PT_LEFT]: (payload: PtLeftPayload) => void;
  [SOCKET_EVENTS.UPDATE_PT]: (payload: PtUpdatePayload) => void;
}

export type CollabSocket = Socket<
  ClientToServerEvents,
  // ServerToClientEvents,
  DefaultEventsMap,
  Record<string, never>, // InterServerEvents (사용 안 함)
  SocketData
>;
