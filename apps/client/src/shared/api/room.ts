import { SessionResponseDto } from "@codejam/common";

const API_BASE_URL = "http://localhost:3000";

export async function createSession(): Promise<SessionResponseDto> {
  const response = await fetch(`${API_BASE_URL}/api/room/prototype/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("세션 생성에 실패했습니다");
  }

  return response.json();
}
