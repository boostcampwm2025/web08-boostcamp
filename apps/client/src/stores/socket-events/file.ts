import { socket } from '@/shared/api/socket';
import {
  SOCKET_EVENTS,
  type RoomDocPayload,
  type RoomAwarenessPayload,
  type FileUpdatePayload,
  type AwarenessUpdatePayload,
  type CodeExecutionResultPayload,
  type CodeExecutionErrorPayload,
} from '@codejam/common';
import { useFileStore } from '../file';

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

  const onCodeExecutionResult = (data: CodeExecutionResultPayload) => {
    console.log(`✅ [CODE_EXECUTION_RESULT]`, data);
  };

  const onCodeExecutionError = (data: CodeExecutionErrorPayload) => {
    console.log(`❌ [CODE_EXECUTION_ERROR]`, data);
  };

  socket.on(SOCKET_EVENTS.ROOM_DOC, onRoomDoc);
  socket.on(SOCKET_EVENTS.ROOM_AWARENESS, onRoomAwareness);
  socket.on(SOCKET_EVENTS.UPDATE_FILE, onUpdateFile);
  socket.on(SOCKET_EVENTS.UPDATE_AWARENESS, onUpdateAwareness);
  socket.on(SOCKET_EVENTS.CODE_EXECUTION_RESULT, onCodeExecutionResult);
  socket.on(SOCKET_EVENTS.CODE_EXECUTION_ERROR, onCodeExecutionError);

  return () => {
    socket.off(SOCKET_EVENTS.ROOM_DOC, onRoomDoc);
    socket.off(SOCKET_EVENTS.ROOM_AWARENESS, onRoomAwareness);
    socket.off(SOCKET_EVENTS.UPDATE_FILE, onUpdateFile);
    socket.off(SOCKET_EVENTS.UPDATE_AWARENESS, onUpdateAwareness);
    socket.off(SOCKET_EVENTS.CODE_EXECUTION_RESULT, onCodeExecutionResult);
    socket.off(SOCKET_EVENTS.CODE_EXECUTION_ERROR, onCodeExecutionError);
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

export const emitExecuteCode = (fileId: string, language: string) => {
  if (!socket.connected) return;

  socket.emit(SOCKET_EVENTS.EXECUTE_CODE, { fileId, language });
};
