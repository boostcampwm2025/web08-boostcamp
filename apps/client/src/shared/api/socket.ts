import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.PROD
  ? window.location.origin
  : import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const socket = io(SOCKET_URL, {
  path: import.meta.env.PROD ? '/socket.io' : undefined,
  autoConnect: false,
  withCredentials: true,
  transports: ['polling', 'websocket'],
});
