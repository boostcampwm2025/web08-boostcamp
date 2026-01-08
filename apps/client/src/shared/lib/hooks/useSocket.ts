import { useEffect } from "react";
import { useSocketStore } from "@/stores/socket";
import { useFileStore } from "@/stores/file";

export const useSocket = (roomCode: string) => {
  const connect = useSocketStore((state) => state.connect);
  const disconnect = useSocketStore((state) => state.disconnect);
  const isConnected = useSocketStore((state) => state.isConnected);

  const initialize = useFileStore((state) => state.initialize);
  const destroy = useFileStore((state) => state.destroy);
  const isInitialized = useFileStore((state) => state.isInitialized);

  // Connect socket and cleanup on unmount
  useEffect(() => {
    connect(roomCode);
    return () => disconnect();
  }, [roomCode, connect, disconnect]);

  // Initialize files after socket connection
  useEffect(() => {
    if (isConnected && !isInitialized) {
      initialize(roomCode);
    }
    return () => {
      if (isInitialized) {
        destroy();
      }
    };
  }, [roomCode, isConnected, isInitialized, initialize, destroy]);

  return {
    isConnected,
  };
};
