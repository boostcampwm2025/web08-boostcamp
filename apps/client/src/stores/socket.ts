import { create } from "zustand";
import { socket } from "@/shared/api/socket";
import { setupDomainEventHandlers, emitJoinRoom } from "./socket-events";

interface SocketState {
  socket: typeof socket;
  isConnected: boolean;
  roomId: string | null;

  cleanup: () => void;

  // Actions
  connect: (roomId: string) => void;
  disconnect: () => void;
  send: (event: string, payload: unknown) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket,
  isConnected: socket.connected,
  roomId: null,

  cleanup: () => {},

  connect: (roomId: string) => {
    const state = get();

    // Guard: Already connected to this room
    if (state.roomId === roomId && socket.connected) {
      return;
    }

    // Cleanup previous connection if switching rooms
    if (state.roomId && state.roomId !== roomId) {
      state.cleanup();
    }

    const onConnect = () => {
      console.log("🟢 Connected to Socket Server");
      set({ isConnected: true });

      emitJoinRoom(roomId);
    };

    const onDisconnect = () => {
      console.log("🔴 Disconnected");
      set({ isConnected: false });
    };

    // Setup connection event listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // Setup domain-specific event handlers
    const cleanupDomainEventHandlers = setupDomainEventHandlers(roomId);

    // Store cleanup function
    const cleanupListeners = () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      cleanupDomainEventHandlers();
    };

    set({ roomId, cleanup: cleanupListeners });

    // Connect socket if not connected
    if (!socket.connected) {
      socket.connect();
    }
  },

  disconnect: () => {
    const state = get();
    state.cleanup();
    socket.disconnect();

    set({ isConnected: false, roomId: null });
  },

  send: (event: string, payload: unknown) => {
    if (!socket.connected) return;
    socket.emit(event, payload);
  },
}));
