import { create } from 'zustand';
import { socket } from '@/shared/api/socket';
import { setupDomainEventHandlers, emitJoinRoom } from './socket-events';

interface SocketState {
  socket: typeof socket;
  isConnected: boolean;
  roomCode: string | null;

  cleanup: () => void;

  // Actions
  connect: (roomCode: string) => void;
  disconnect: () => void;
  send: (event: string, ...args: unknown[]) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket,
  isConnected: socket.connected,
  roomCode: null,

  cleanup: () => {},

  connect: (roomCode: string) => {
    const state = get();

    // Guard: Already connected to this room
    if (state.roomCode === roomCode && socket.connected) {
      return;
    }

    // Cleanup previous connection if switching rooms
    if (state.roomCode && state.roomCode !== roomCode) {
      state.cleanup();
    }

    const onConnect = () => {
      console.log('🟢 Connected to Socket Server');
      set({ isConnected: true });

      emitJoinRoom(roomCode);
    };

    const onDisconnect = () => {
      console.log('🔴 Disconnected');
      set({ isConnected: false });
    };

    // Setup connection event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Setup domain-specific event handlers
    const cleanupDomainEventHandlers = setupDomainEventHandlers();

    // Store cleanup function
    const cleanupListeners = () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      cleanupDomainEventHandlers();
    };

    set({ roomCode, cleanup: cleanupListeners });

    // Connect socket if not connected
    if (!socket.connected) {
      socket.connect();
    }
  },

  disconnect: () => {
    const state = get();
    state.cleanup();
    socket.disconnect();

    set({ isConnected: false, roomCode: null });
  },

  send: (event: string, ...args: unknown[]) => {
    if (!socket.connected) return;
    socket.emit(event, ...args);
  },
}));
