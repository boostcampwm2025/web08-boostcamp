export const ROUTES = {
  HOME: '/',
  ROOM: (roomCode: string) => `/rooms/${roomCode}`,
  JOIN: (roomCode: string, token?: string) =>
    token ? `/join/${roomCode}?token=${token}` : `/join/${roomCode}`,
} as const;
