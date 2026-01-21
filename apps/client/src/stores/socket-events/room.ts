import { socket } from '@/shared/api/socket';
import { SOCKET_EVENTS, type WelcomePayload } from '@codejam/common';
import { useRoomStore } from '../room';
import { useFileStore } from '../file';
import {
  getRoomToken,
  setRoomToken,
  removeRoomToken,
} from '@/shared/lib/storage';

const redirectToHome = () => {
  window.location.href = '/';
};

export const setupRoomEventHandlers = () => {
  const onWelcome = (data: WelcomePayload) => {
    console.log(`🎉 [WELCOME] My PtId: ${data.myPtId}`);

    const { myPtId, token } = data;
    const { roomCode, setMyPtId } = useRoomStore.getState();

    if (!roomCode) return;

    setMyPtId(myPtId);
    setRoomToken(roomCode, token);

    // Initialize filestore after joining room
    const { initialize } = useFileStore.getState();
    initialize(roomCode);
  };

  const onGoodbye = () => {
    console.log('👋 [GOODBYE] Left the room');

    const { roomCode } = useRoomStore.getState();
    if (roomCode) removeRoomToken(roomCode);

    redirectToHome();
  };

  socket.on(SOCKET_EVENTS.WELCOME, onWelcome);
  socket.on(SOCKET_EVENTS.GOODBYE, onGoodbye);

  return () => {
    socket.off(SOCKET_EVENTS.WELCOME, onWelcome);
    socket.off(SOCKET_EVENTS.GOODBYE, onGoodbye);
  };
};

export const emitJoinRoom = (roomCode: string, nickname?: string) => {
  const savedRoomToken = getRoomToken(roomCode);

  socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
    roomCode,
    token: savedRoomToken || undefined,
    nickname: nickname || undefined,
  });
};

export const emitLeftRoom = () => {
  socket.emit(SOCKET_EVENTS.LEFT_ROOM);
};
