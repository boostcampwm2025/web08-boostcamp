import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '@/shared/api/socket';
import { emitJoinRoom } from '@/stores/socket-events';
import { useRoomStore } from '@/stores/room';
import { getRoomToken } from '@/shared/lib/storage';
import { useTempValue } from '@/stores/temp';
import { ERROR_CODE } from '@codejam/common';
import { joinRoom } from '@/shared/api/room';

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

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const { tempRoomPassword, setTempRoomPassword } = useTempValue();

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
      if (error.type === ERROR_CODE.PERMISSION_DENIED) {
        return;
      }
      if (
        error.type === ERROR_CODE.PASSWORD_REQUIRED ||
        error.message === ERROR_CODE.PASSWORD_REQUIRED
      ) {
        setIsPasswordDialogOpen(true);
      } else if (
        error.type === ERROR_CODE.PASSWORD_UNCORRECT ||
        error.message === ERROR_CODE.PASSWORD_UNCORRECT
      ) {
        setIsPasswordDialogOpen(true);
        setPasswordError('패스워드가 틀렸습니다.');
      } else if (
        error.type === ERROR_CODE.NICKNAME_REQUIRED ||
        error.message === ERROR_CODE.NICKNAME_REQUIRED
      ) {
        setIsPasswordDialogOpen(false);
        setIsNicknameDialogOpen(true);
      } else if (
        error.type === ERROR_CODE.ROOM_NOT_FOUND ||
        error.message === ERROR_CODE.ROOM_NOT_FOUND
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
    async (nickname: string) => {
      if (!paramCode) return;
      setRoomError('');

      try {
        // [HTTP] 입장 API 호출 (여기서 쿠키!)
        await joinRoom(paramCode, nickname, tempRoomPassword);

        // [Socket] 소켓 재연결
        // 이제 쿠키가 있으므로, 소켓이 다시 연결되면 서버에서 복원 로직
        socket.disconnect();
        socket.once('connect', () => {
          console.log('🔄 Reconnected, emitting joinRoom...');
          emitJoinRoom(paramCode);
        });
        socket.connect();

        emitJoinRoom(paramCode);

        setIsNicknameDialogOpen(false);
      } catch (e) {
        const error = e as Error;
        setRoomError(error.message);
      }
    },
    [paramCode, tempRoomPassword],
  );

  const handlePasswordConfirm = useCallback(
    (password: string) => {
      if (!paramCode) return;

      setPasswordError('');
      setTempRoomPassword(password);
      emitJoinRoom(paramCode, undefined, password);
    },
    [paramCode],
  );

  return {
    paramCode: paramCode || undefined,
    roomCode,
    isNicknameDialogOpen,
    isPasswordDialogOpen,
    setIsNicknameDialogOpen,
    setIsPasswordDialogOpen,
    passwordError,
    roomError,
    handleNicknameConfirm,
    handlePasswordConfirm,
  };
}
