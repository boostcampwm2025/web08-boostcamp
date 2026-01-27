import { useState } from 'react';

// 시스템 메시지와 사용자 채팅을 통합 관리하는 타입
type ChatMessage =
  | { id: string; type: 'system'; message: string }
  | { id: string; type: 'user'; nickname: string; content: string }; // 추후 추가

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // TODO: 소켓 이벤트 핸들러 추가

  return (
    // TODO: UI 구현
    <div>Chat Widget</div>
  );
}
