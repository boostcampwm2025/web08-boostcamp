import { socket } from "@/shared/api/socket";
import { SOCKET_EVENTS, type WelcomePayload } from "@codejam/common";
import { useRoomStore } from "../room";
import { useFileStore } from "../file";
import { getRoomToken } from "@/shared/lib/storage";
import { setRoomToken } from "@/shared/lib/storage";

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

  socket.on(SOCKET_EVENTS.WELCOME, onWelcome);

  return () => {
    socket.off(SOCKET_EVENTS.WELCOME, onWelcome);
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
