import { useEffect } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { setRoomToken } from '@/shared/lib/storage';
import { getRoomUrl } from '@/shared/lib/routes';

export default function JoinPage() {
  const { roomCode, token } = useLoaderData() as {
    roomCode: string;
    token: string;
  };
  const navigate = useNavigate();

  useEffect(() => {
    // Save token to localStorage
    setRoomToken(roomCode, token);

    // Navigate to room immediately
    const url = getRoomUrl(roomCode);
    navigate(url, { replace: true });
  }, [roomCode, token, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto" />
        <p className="text-gray-700 dark:text-gray-300">Joining room...</p>
      </div>
    </div>
  );
}
