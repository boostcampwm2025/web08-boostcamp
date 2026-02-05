import { useEffect } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { ROUTES } from '@codejam/common';
import { Loader2 } from 'lucide-react';

export default function JoinPage() {
  const { roomCode, token } = useLoaderData() as {
    roomCode: string;
    token: string;
  };
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to room immediately
    const url = ROUTES.ROOM(roomCode);
    navigate(url, { replace: true });
  }, [roomCode, token, navigate]);

  return (
    <main className="flex h-screen flex-col items-center justify-center bg-gray-100">
      <section className="flex flex-col items-center text-center">
        <Loader2 className="text-primary mb-4 h-16 w-16 animate-spin" />
        <h1 className="mb-4 text-2xl font-semibold text-gray-800">
          방 참가 중
        </h1>
        <p className="mb-8 text-gray-500">잠시만 기다려 주세요...</p>
      </section>
    </main>
  );
}
