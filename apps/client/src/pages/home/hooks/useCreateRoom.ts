import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuickRoom, createCustomRoom } from '@/shared/api/room';
import { ROUTES, type CreateCustomRoomRequest } from '@codejam/common';

export function useCreateRoom() {
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleQuickStart = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const { roomCode } = await createQuickRoom();
      navigate(ROUTES.ROOM(roomCode));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomStart = async (data: CreateCustomRoomRequest) => {
    if (isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const { roomCode } = await createCustomRoom(data);
      navigate(ROUTES.ROOM(roomCode));
      setIsPopoverOpen(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    error,
    isLoading,
    isPopoverOpen,
    setIsPopoverOpen,
    handleQuickStart,
    handleCustomStart,
  };
}
