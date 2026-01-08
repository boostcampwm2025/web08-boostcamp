import { socket } from "@/shared/api/socket";
import { SOCKET_EVENTS, type WelcomePayload } from "@codejam/common";
import { useRoomStore } from "../room";

export const setupRoomEventHandlers = (roomCode: string) => {
  const onWelcome = (data: WelcomePayload) => {
    console.log(`🎉 [WELCOME] My PtId: ${data.myPtId}`);
    localStorage.setItem(`ptId:${roomCode}`, data.myPtId);
    useRoomStore.getState().setMyPtId(data.myPtId);
  };

  socket.on(SOCKET_EVENTS.WELCOME, onWelcome);

  return () => {
    socket.off(SOCKET_EVENTS.WELCOME, onWelcome);
  };
};

export const emitJoinRoom = (roomCode: string, nickname?: string) => {
  const savedPtId = localStorage.getItem(`ptId:${roomCode}`);
  socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
    roomCode,
    ptId: savedPtId || undefined,
    nickname: nickname || undefined,
  });
};
