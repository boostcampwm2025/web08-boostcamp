import type { RoomToken } from '@codejam/common';

export const getRoomTokenKey = (roomCode: string): string => {
  return `room:${roomCode}`;
};

export const getRoomToken = (roomCode: string): string | null => {
  const key = getRoomTokenKey(roomCode);
  return localStorage.getItem(key);
};

export const setRoomToken = (roomCode: string, token: RoomToken): void => {
  const key = getRoomTokenKey(roomCode);
  localStorage.setItem(key, token);
};

export const removeRoomToken = (roomCode: string): void => {
  const key = getRoomTokenKey(roomCode);
  localStorage.removeItem(key);
};
