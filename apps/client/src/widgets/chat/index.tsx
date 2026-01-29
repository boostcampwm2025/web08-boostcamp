import { useState, useCallback, useEffect } from 'react';
import { useChatStore } from '@/stores/chat';
import { ChatIcon } from './components/ChatIcon';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { Button } from '@codejam/ui';
import { X, GripHorizontal } from 'lucide-react';

const MIN_WIDTH = 280;
const MIN_HEIGHT = 200;
const MAX_WIDTH = 600;
const MAX_HEIGHT = 600;
const DEFAULT_WIDTH = 340;
const DEFAULT_HEIGHT = 380;

export function Chat() {
  const messages = useChatStore((state) => state.messages);
  const isChatOpen = useChatStore((state) => state.isChatOpen);
  const unreadCount = useChatStore((state) => state.unreadCount);
  const setChatOpen = useChatStore((state) => state.setChatOpen);

  const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // 우측 하단 고정이므로, 마우스 위치에서 채팅창 위치 계산
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, window.innerWidth - e.clientX - 16));
      const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, window.innerHeight - e.clientY - 80));
      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <>
      <ChatIcon
        unreadCount={unreadCount}
        onClick={() => setChatOpen(!isChatOpen)}
      />

      {isChatOpen && (
        <div
          className="border-border bg-background ring-foreground/10 fixed right-4 bottom-20 z-50 flex flex-col rounded-lg shadow-lg ring-1"
          style={{ width: size.width, height: size.height }}
        >
          {/* 리사이즈 핸들 (좌측 상단) */}
          <div
            onMouseDown={handleMouseDown}
            className="bg-muted/50 hover:bg-muted absolute top-0 left-0 flex h-6 w-6 cursor-nw-resize items-center justify-center rounded-tl-lg rounded-br-lg opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100"
            style={{ opacity: isResizing ? 1 : undefined }}
            title="드래그하여 크기 조절"
          >
            <GripHorizontal className="text-muted-foreground h-3 w-3 rotate-45" />
          </div>

          {/* 헤더 */}
          <div className="border-border flex shrink-0 items-center justify-between border-b px-3 py-2">
            <span className="text-foreground text-sm font-medium">채팅</span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setChatOpen(false)}
              aria-label="채팅 닫기"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* 메시지 영역 */}
          <div className="min-h-0 flex-1">
            <ChatWindow messages={messages} />
          </div>

          {/* 입력 영역 */}
          <ChatInput />
        </div>
      )}
    </>
  );
}
