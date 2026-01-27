import type {
  RoomJoinStatus,
  CreateQuickRoomResponse,
  CreateCustomRoomResponse,
  CreateCustomRoomRequest,
} from '@codejam/common';
import { API_ENDPOINTS } from '@codejam/common';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function checkRoomExists(
  roomCode: string,
): Promise<RoomJoinStatus> {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.ROOM.JOINABLE(roomCode)}`,
    );
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
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.ROOM.CREATE_QUICK}`,
      {
        method: 'POST',
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      const message =
        errorData?.error?.message ||
        errorData?.message ||
        'Failed to create quick room';

      throw new Error(message);
    }

    return await response.json();
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}

export const createCustomRoom = async (
  data: CreateCustomRoomRequest,
): Promise<CreateCustomRoomResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.ROOM.CREATE_CUSTOM}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      const message =
        errorData?.error?.message ||
        errorData?.message ||
        'Failed to create custom room';

      throw new Error(message);
    }

    return response.json();
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export const joinRoom = async (
  roomCode: string,
  nickname: string,
  password: string | null,
) => {
  const response = await fetch(`${API_BASE_URL}/rooms/${roomCode}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname, password }),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to join room');
  }
};

export async function verifyPassword(roomCode: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomCode}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      const message =
        errorData?.error?.message ||
        errorData?.message ||
        'Failed to verify password';

      throw new Error(message);
    }

    return await response.json();
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}
