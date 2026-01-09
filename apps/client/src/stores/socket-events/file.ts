import { socket } from "@/shared/api/socket";
import {
  SOCKET_EVENTS,
  type RoomDocPayload,
  type RoomAwarenessPayload,
  type FileUpdatePayload,
  type AwarenessUpdatePayload,
} from "@codejam/common";
import { useFileStore } from "../file";

export const setupFileEventHandlers = () => {
  const onRoomDoc = (data: RoomDocPayload) => {
    console.log(`📁 [ROOM_DOC]`);
    useFileStore.getState().applyRemoteDocUpdate(data.message);
  };

  const onRoomAwareness = (data: RoomAwarenessPayload) => {
    console.log(`🧍 [ROOM_AWARENESS]`);
    useFileStore.getState().applyRemoteAwarenessUpdate(data.message);
  };

  const onUpdateFile = (data: FileUpdatePayload) => {
    console.log(`📝 [UPDATE_FILE] From Server`);
    useFileStore.getState().applyRemoteDocUpdate(data.message);
  };

  const onUpdateAwareness = (data: AwarenessUpdatePayload) => {
    console.log(`🧍 [UPDATE_AWARENESS] From Server`);
    useFileStore.getState().applyRemoteAwarenessUpdate(data.message);
  };

  socket.on(SOCKET_EVENTS.ROOM_DOC, onRoomDoc);
  socket.on(SOCKET_EVENTS.ROOM_AWARENESS, onRoomAwareness);
  socket.on(SOCKET_EVENTS.UPDATE_FILE, onUpdateFile);
  socket.on(SOCKET_EVENTS.UPDATE_AWARENESS, onUpdateAwareness);

  return () => {
    socket.off(SOCKET_EVENTS.ROOM_DOC, onRoomDoc);
    socket.off(SOCKET_EVENTS.ROOM_AWARENESS, onRoomAwareness);
    socket.off(SOCKET_EVENTS.UPDATE_FILE, onUpdateFile);
    socket.off(SOCKET_EVENTS.UPDATE_AWARENESS, onUpdateAwareness);
  };
};

export const emitFileUpdate = (roomCode: string, message: Uint8Array) => {
  if (!socket.connected) return;

  socket.emit(SOCKET_EVENTS.UPDATE_FILE, {
    roomCode,
    message,
  });
};

export const emitAwarenessUpdate = (roomCode: string, message: Uint8Array) => {
  if (!socket.connected) return;

  socket.emit(SOCKET_EVENTS.UPDATE_AWARENESS, {
    roomCode,
    message,
  });
};
