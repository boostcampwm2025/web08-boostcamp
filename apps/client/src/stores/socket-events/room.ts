import { socket } from '@/shared/api/socket';
import { SOCKET_EVENTS, type WelcomePayload } from '@codejam/common';
import { useRoomStore } from '../room';
import { useFileStore } from '../file';
import { getRoomToken } from '@/shared/lib/storage';
import { setRoomToken } from '@/shared/lib/storage';
import { toast } from 'sonner';

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

  const onRoomDestroyed = () => {
    console.log(`💥 [ROOM_DESTROYED] Room has been destroyed`);

    let countdown = 3;
    const toastId = toast.error('방이 폭파되었습니다.', {
      description: `${countdown}초 후 홈으로 이동합니다.`,
      duration: Infinity, // 자동으로 사라지지 않음
    });

    const interval = setInterval(() => {
      countdown -= 1;
      if (countdown > 0) {
        toast.error('방이 폭파되었습니다.', {
          id: toastId,
          description: `${countdown}초 후 홈으로 이동합니다.`,
          duration: Infinity,
        });
      } else {
        clearInterval(interval);
        toast.dismiss(toastId);
        window.location.href = '/';
      }
    }, 1000);
  };

  socket.on(SOCKET_EVENTS.WELCOME, onWelcome);
  socket.on(SOCKET_EVENTS.ROOM_DESTROYED, onRoomDestroyed);

  return () => {
    socket.off(SOCKET_EVENTS.WELCOME, onWelcome);
    socket.off(SOCKET_EVENTS.ROOM_DESTROYED, onRoomDestroyed);
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
