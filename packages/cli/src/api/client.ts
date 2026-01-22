import type {
  CreateQuickRoomResponse,
  CreateCustomRoomRequest,
  CreateCustomRoomResponse,
} from './types.js';

export class ApiClient {
  constructor(private baseUrl: string) {}

  async createQuickRoom(): Promise<CreateQuickRoomResponse> {
    const response = await fetch(`${this.baseUrl}/api/rooms/quick`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to create quick room: ${response.statusText}`);
    }

    return response.json();
  }

  async createCustomRoom(
    request: CreateCustomRoomRequest,
  ): Promise<CreateCustomRoomResponse> {
    const response = await fetch(`${this.baseUrl}/api/rooms/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create custom room: ${response.statusText}`);
    }

    return response.json();
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
