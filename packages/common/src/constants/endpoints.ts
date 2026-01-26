const API_PREFIX = '/api';

export const API_ENDPOINTS = {
  ROOM: {
    CREATE_QUICK: `${API_PREFIX}/rooms/quick`,
    CREATE_CUSTOM: `${API_PREFIX}/rooms/custom`,
    JOINABLE: (roomCode: string) => `${API_PREFIX}/rooms/${roomCode}/joinable`,
    DESTROY: (roomCode: string) => `${API_PREFIX}/rooms/${roomCode}`,
  },
  HEALTH: '/health',
} as const;
