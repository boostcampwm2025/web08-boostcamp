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
    const response = await fetch(`${ROOM_API_PREFIX}/${roomCode}/join`, {
      method: "POST",
    });

    if (!response.ok) {
      const message = "Failed to join room";
      throw new Error(message);
    }
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}
