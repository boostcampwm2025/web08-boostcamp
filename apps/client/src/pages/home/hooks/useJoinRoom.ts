import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkRoomJoinable } from '@/shared/api/room';
import { ROUTES, roomCodeSchema, LIMITS } from '@codejam/common';
import { ROOM_CODE_LENGTH } from '../components/RoomCodeInput';

export function useJoinRoom() {
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorKey, setErrorKey] = useState(0);
  const isCodeComplete = roomCode.length === LIMITS.ROOM_CODE_LENGTH;

  const validateRoomCode = (code: string) => {
    if (code.length < ROOM_CODE_LENGTH) return true;

    const result = roomCodeSchema.safeParse(code);
    if (!result.success) {
      setErrorMessage(result.error.issues[0].message);
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleChangeRoomCode = (value: string) => {
    const upperValue = value.toUpperCase();
    setRoomCode(upperValue);
    validateRoomCode(upperValue);
  };

  const handleJoinRoom = async () => {
    if (!isCodeComplete || !validateRoomCode(roomCode)) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      await checkRoomJoinable(roomCode);
      navigate(ROUTES.ROOM(roomCode));
    } catch (e) {
      const message = e instanceof Error ? e.message : '알 수 없는 오류';
      setErrorMessage(message);
      setErrorKey((k) => k + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    roomCode,
    handleChangeRoomCode,
    handleJoinRoom,
    isLoading,
    errorMessage,
    errorKey,
    isCodeComplete,
  };
}
