import { useChatStore } from '@/stores/chat';
import { ChatIcon } from './components/ChatIcon';
import { ChatWindow } from './components/ChatWindow';
import { Button } from '@codejam/ui';
import { X } from 'lucide-react';

export function Chat() {
  const messages = useChatStore((state) => state.messages);
  const isChatOpen = useChatStore((state) => state.isChatOpen);
  const unreadCount = useChatStore((state) => state.unreadCount);
  const setChatOpen = useChatStore((state) => state.setChatOpen);

  return (
    <>
      <ChatIcon unreadCount={unreadCount} onClick={() => setChatOpen(!isChatOpen)} />

      {isChatOpen && (
        <div className="border-border bg-background ring-foreground/10 fixed bottom-20 right-4 z-50 flex w-[320px] flex-col rounded-lg shadow-lg ring-1">
          <div className="border-border flex items-center justify-between border-b px-3 py-2">
            <span className="text-sm font-medium">채팅</span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setChatOpen(false)}
              aria-label="채팅 닫기"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ChatWindow messages={messages} />
        </div>
      )}
    </>
  );
}
