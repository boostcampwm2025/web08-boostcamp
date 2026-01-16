import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '@/shared/api/socket';
import { emitJoinRoom } from '@/stores/socket-events';
import { useRoomStore } from '@/stores/room';
import { getRoomToken } from '@/shared/lib/storage';

export function useRoomJoin() {
  const { roomCode: paramCode } = useParams<{ roomCode: string }>();
  const [roomError, setRoomError] = useState<string>('');
  const [, setUpdate] = useState(0);

  const roomCode = useRoomStore((state) => state.roomCode);
  const setRoomCode = useRoomStore((state) => state.setRoomCode);

  const shouldShowNicknameDialog = useMemo(() => {
    if (!paramCode) return false;
    const savedRoomToken = getRoomToken(paramCode);
    return !savedRoomToken;
  }, [paramCode]);

  const [isNicknameDialogOpen, setIsNicknameDialogOpen] = useState(
    shouldShowNicknameDialog,
  );

  useEffect(() => {
    setIsNicknameDialogOpen(shouldShowNicknameDialog);
  }, [shouldShowNicknameDialog]);

  // paramCode를 roomStore에 설정
  useEffect(() => {
    if (paramCode) setRoomCode(paramCode);
  }, [paramCode, roomCode, setRoomCode]);

  // Socket 에러 핸들링
  useEffect(() => {
    const handleError = (error: { type?: string; message?: string }) => {
      // PERMISSION_DENIED는 에디터 레벨에서 처리하므로 여기서는 무시
      if (error.type === 'PERMISSION_DENIED') {
        return;
      }

      if (
        error.type === 'NICKNAME_REQUIRED' ||
        error.message === 'NICKNAME_REQUIRED'
      ) {
        setIsNicknameDialogOpen(true);
      } else if (
        error.type === 'ROOM_NOT_FOUND' ||
        error.message === 'ROOM_NOT_FOUND'
      ) {
        setRoomError('방을 찾을 수 없습니다.');
      } else {
        setRoomError(error.message || '오류가 발생했습니다.');
      }
    };

    const handleUpdate = () => {
      setUpdate(Date.now());
    };

    socket.on('error', handleError);
    socket.on('update', handleUpdate);

    return () => {
      socket.off('error', handleError);
      socket.off('update', handleUpdate);
    };
  }, []);

  // 신규 사용자 판단 및 닉네임 모달 표시
  useEffect(() => {
    if (!paramCode) return;

    const savedRoomToken = getRoomToken(paramCode);
    // localStorage에 ptId가 없으면 신규 유저 → 모달 표시
    if (!savedRoomToken) {
      setIsNicknameDialogOpen(true);
    }
    // 재접속 유저는 socket.connect()에서 자동으로 emitJoinRoom 호출됨
  }, [paramCode]);

  const handleNicknameConfirm = useCallback(
    (nickname: string) => {
      if (!paramCode) return;

      setRoomError('');
      emitJoinRoom(paramCode, nickname);
      setIsNicknameDialogOpen(false);
    },
    [paramCode],
  );

  return {
    paramCode: paramCode || undefined,
    roomCode,
    isNicknameDialogOpen,
    setIsNicknameDialogOpen,
    roomError,
    handleNicknameConfirm,
  };
}
