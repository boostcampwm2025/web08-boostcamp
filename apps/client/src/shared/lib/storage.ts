/**
 * Generate localStorage key for storing participant ID
 * @param roomCode - The room code
 * @returns localStorage key string
 */
export const getRoomPtIdKey = (roomCode: string): string => {
  return `room:${roomCode}:ptId`;
};

/**
 * Save participant ID to localStorage
 * @param roomCode - The room code
 * @param ptId - The participant ID
 */
export const saveRoomPtId = (roomCode: string, ptId: string): void => {
  const key = getRoomPtIdKey(roomCode);
  localStorage.setItem(key, ptId);
};

/**
 * Get participant ID from localStorage
 * @param roomCode - The room code
 * @returns The participant ID or null if not found
 */
export const getRoomPtId = (roomCode: string): string | null => {
  const key = getRoomPtIdKey(roomCode);
  return localStorage.getItem(key);
};
