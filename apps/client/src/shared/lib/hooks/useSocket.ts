import { useEffect } from 'react';
import { useSocketStore } from '@/stores/socket';
import { useFileStore } from '@/stores/file';

export const useSocket = (roomCode: string) => {
  const connect = useSocketStore((state) => state.connect);
  const disconnect = useSocketStore((state) => state.disconnect);
  const isConnected = useSocketStore((state) => state.isConnected);

  const destroy = useFileStore((state) => state.destroy);

  // Connect socket and cleanup on unmount
  useEffect(() => {
    connect(roomCode);
    return () => {
      disconnect();
      destroy();
    };
  }, [roomCode, connect, disconnect, destroy]);

  return {
    isConnected,
  };
};
