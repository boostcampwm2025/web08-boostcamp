import type { RoomToken } from '@codejam/common';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const ROOM_API_PREFIX = `${API_BASE_URL}/api/rooms`;

interface CreateQuickRoomResponse {
  roomCode: string;
  token: RoomToken;
}

interface RoomExistsResponse {
  exists: boolean;
  max: boolean;
}

export async function checkRoomExists(
  roomCode: string,
): Promise<RoomExistsResponse> {
  try {
    const response = await fetch(`${ROOM_API_PREFIX}/${roomCode}/join`);
    const json = (await response.json()) as {
      message?: string;
    } & RoomExistsResponse;
    if (!response.ok) {
      const message = () => {
        if (json.message === 'ROOM_NOT_FOUND') {
          return 'Room not found';
        }

        return 'Unknown Error';
      };

      throw new Error(message());
    }
    return json;
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
