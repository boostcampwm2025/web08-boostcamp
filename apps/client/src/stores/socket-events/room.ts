import { socket } from "@/shared/api/socket";
import { SOCKET_EVENTS, type WelcomePayload } from "@codejam/common";
import { useRoomStore } from "../room";
import { getRoomPtId } from "@/shared/lib/storage";

export const setupRoomEventHandlers = () => {
  const onWelcome = (data: WelcomePayload) => {
    console.log(`🎉 [WELCOME] My PtId: ${data.myPtId}`);
    useRoomStore.getState().setMyPtId(data.myPtId);
  };

  socket.on(SOCKET_EVENTS.WELCOME, onWelcome);

  return () => {
    socket.off(SOCKET_EVENTS.WELCOME, onWelcome);
  };
};

export const emitJoinRoom = (roomCode: string, nickname?: string) => {
  const savedPtId = getRoomPtId(roomCode);

  socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
    roomCode,
    ptId: savedPtId || undefined,
    nickname: nickname || undefined,
  });
};
