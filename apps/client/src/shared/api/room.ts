import type { RoomJoinStatus, RoomToken } from '@codejam/common';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const ROOM_API_PREFIX = `${API_BASE_URL}/api/rooms`;

interface CreateQuickRoomResponse {
  roomCode: string;
  token: RoomToken;
}

export async function checkRoomExists(
  roomCode: string,
): Promise<RoomJoinStatus> {
  try {
    const response = await fetch(`${ROOM_API_PREFIX}/${roomCode}/joinable`);
    const text = (await response.text()) as RoomJoinStatus;
    if (text === 'NOT_FOUND') {
      throw new Error('Room not found');
    }

    return text;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}

export async function createQuickRoom(): Promise<CreateQuickRoomResponse> {
  try {
    const response = await fetch(`${ROOM_API_PREFIX}/quick`, {
      method: 'POST',
    });

    if (!response.ok) {
      const message = 'Failed to create quick room';
      throw new Error(message);
    }

    return await response.json();
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}

export async function checkHost(
  roomCode: string,
  ptId: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${ROOM_API_PREFIX}/${roomCode}/checkHost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ptId }),
    });

    if (!response.ok) {
      const message = 'Failed to check host permission';
      throw new Error(message);
    }

    const { ok } = await response.json();
    return ok;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}
