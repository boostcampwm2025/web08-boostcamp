import type {
  CreateQuickRoomResponse,
  CreateCustomRoomRequest,
  CreateCustomRoomResponse,
  RoomJoinStatus,
} from './types.js';

export class ApiClient {
  constructor(private baseUrl: string) {}

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async createQuickRoom(): Promise<CreateQuickRoomResponse> {
    return this.request<CreateQuickRoomResponse>('/api/rooms/quick', {
      method: 'POST',
    });
  }

  async createCustomRoom(
    request: CreateCustomRoomRequest,
  ): Promise<CreateCustomRoomResponse> {
    return this.request<CreateCustomRoomResponse>('/api/rooms/custom', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async checkJoinable(roomCode: string): Promise<RoomJoinStatus> {
    const response = await fetch(
      `${this.baseUrl}/api/rooms/${roomCode}/joinable`,
      {
        method: 'GET',
      },
    );

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    const text = await response.text();
    // Remove quotes if the response is a quoted string like "JOINABLE"
    return text.replace(/^"|"$/g, '') as RoomJoinStatus;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
