export const ROUTES = {
  HOME: '/',
  ROOM: (roomCode: string) => `/rooms/${roomCode}`,
  JOIN: (roomCode: string) => `/join/${roomCode}`,
} as const;
