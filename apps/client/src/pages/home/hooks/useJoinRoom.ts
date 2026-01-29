import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkRoomJoinable } from '@/shared/api/room';
import { ROUTES } from '@codejam/common';
import { ROOM_CODE_LENGTH } from '../components/RoomCodeInput';

export function useJoinRoom() {
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState<string[]>(
    Array(ROOM_CODE_LENGTH).fill(''),
  );
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isCodeComplete = roomCode.every((digit) => digit !== '');

  const handleJoinRoom = async () => {
    const code = roomCode.join('');
    if (code.length !== ROOM_CODE_LENGTH || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const status = await checkRoomJoinable(code);
      if (status === 'FULL') {
        setError('방의 정원이 초과되었습니다.');
      } else {
        navigate(ROUTES.ROOM(code));
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    roomCode,
    setRoomCode,
    error,
    isLoading,
    isCodeComplete,
    handleJoinRoom,
  };
}
