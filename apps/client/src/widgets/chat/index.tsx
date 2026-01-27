import { useChatStore } from '@/stores/chat';

export function Chat() {
  // store에서 메시지와 UI 상태 가져오기
  const messages = useChatStore((state) => state.messages);
  const isChatOpen = useChatStore((state) => state.isChatOpen);
  const unreadCount = useChatStore((state) => state.unreadCount);
  const setChatOpen = useChatStore((state) => state.setChatOpen);

  // TODO: UI 구현 (Base UI 사용)
  // - ChatIcon: 채팅 아이콘 + 읽지 않은 메시지 배지
  // - ChatWindow: 메시지 목록 표시 (채팅창이 열려있을 때)

  return (
    // TODO: UI 구현
    <div>Chat Widget</div>
  );
}
