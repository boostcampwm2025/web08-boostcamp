import { useEffect } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { getRoomUrl } from '@/shared/lib/routes';

export default function JoinPage() {
  const { roomCode, token } = useLoaderData() as {
    roomCode: string;
    token: string;
  };
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to room immediately
    const url = getRoomUrl(roomCode);
    navigate(url, { replace: true });
  }, [roomCode, token, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900 dark:border-white" />
        <p className="text-gray-700 dark:text-gray-300">Joining room...</p>
      </div>
    </div>
  );
}
