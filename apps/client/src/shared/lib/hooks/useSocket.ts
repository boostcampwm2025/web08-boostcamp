import { useEffect } from "react";
import { useSocketStore } from "@/stores/socket";
import { useFileStore } from "@/stores/file";

export const useSocket = (roomId: string) => {
  const connect = useSocketStore((state) => state.connect);
  const disconnect = useSocketStore((state) => state.disconnect);
  const isConnected = useSocketStore((state) => state.isConnected);

  const initialize = useFileStore((state) => state.initialize);
  const destroy = useFileStore((state) => state.destroy);
  const isInitialized = useFileStore((state) => state.isInitialized);

  // Connect socket and cleanup on unmount
  useEffect(() => {
    connect(roomId);
    return () => disconnect();
  }, [roomId, connect, disconnect]);

  // Initialize files after socket connection
  useEffect(() => {
    if (isConnected && !isInitialized) {
      initialize(roomId);
    }
    return () => {
      if (isInitialized) {
        destroy();
      }
    };
  }, [roomId, isConnected, isInitialized, initialize, destroy]);

  return {
    isConnected,
  };
};
