// Room REST API
// TODO: Error message mapping

const ROOM_API_PREFIX = "/api/rooms";

interface CreateQuickRoomResponse {
  roomCode: string;
  myPtId: string;
}

export async function checkRoomExists(roomCode: string): Promise<boolean> {
  try {
    const response = await fetch(`${ROOM_API_PREFIX}/${roomCode}/exists`);
    const { exists } = await response.json();
    return exists;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}

export async function createQuickRoom(): Promise<CreateQuickRoomResponse> {
  try {
    const response = await fetch(`${ROOM_API_PREFIX}/quick`, {
      method: "POST",
    });

    if (!response.ok) {
      const message = "Failed to create quick room";
      throw new Error(message);
    }

    return await response.json();
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}

export async function joinRoom(roomCode: string): Promise<void> {
  try {
    const response = await fetch(`${ROOM_API_PREFIX}/${roomCode}/join`);

    if (!response.ok) {
      const message = "Failed to join room";
      throw new Error(message);
    }

    const { url } = await response.json();
    if (url) {
      window.location.href = url;
    }
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}

export async function checkHost(roomCode: string, ptId: string): Promise<boolean> {
  try {
    const response = await fetch(`${ROOM_API_PREFIX}/${roomCode}/checkHost`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ptId,
      })
    });

    if (!response.ok) {
      const message = "Failed to check host permission";
      throw new Error(message);
    }

    const { ok } = await response.json();
    return ok;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}