import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuickRoom, createCustomRoom } from '@/shared/api/room';
import { ROUTES, type CreateCustomRoomRequest } from '@codejam/common';

export function useCreateRoom() {
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'main' | 'form'>('main');

  const isFormOpen = view === 'form';
  const toggleForm = () =>
    setView((prev) => (prev === 'main' ? 'form' : 'main'));

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
      setView('main');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    error,
    isLoading,
    isFormOpen,
    toggleForm,
    handleQuickStart,
    handleCustomStart,
  };
}
