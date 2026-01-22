export interface CreateQuickRoomResponse {
  roomCode: string;
  token: string;
}

export interface CreateCustomRoomRequest {
  maxPts: number;
  roomPassword?: string;
  hostPassword?: string;
}

export interface CreateCustomRoomResponse {
  roomCode: string;
  token: string;
}
