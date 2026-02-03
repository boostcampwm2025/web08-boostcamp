import { useChatStore } from '@/stores/chat';
import { ChatIcon } from './components/ChatIcon';
import { ChatPanel } from './components/ChatPanel';

export function Chat() {
  const isChatOpen = useChatStore((state) => state.isChatOpen);
  const unreadCount = useChatStore((state) => state.unreadCount);
  const setChatOpen = useChatStore((state) => state.setChatOpen);

  return (
    <div className="fixed inset-0 z-50">
      <ChatIcon
        unreadCount={unreadCount}
        onClick={() => setChatOpen(!isChatOpen)}
      />

      {isChatOpen && <ChatPanel />}
    </div>
  );
}
