import { useState, useCallback, useEffect } from 'react';
import { useChatStore } from '@/stores/chat';
import { Button } from '@codejam/ui';
import { X, GripHorizontal } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { ChatInput } from './ChatInput';

const MIN_WIDTH = 280;
const MIN_HEIGHT = 200;
const DEFAULT_WIDTH = 340;
const DEFAULT_HEIGHT = 380;

/** right-4(16px), bottom-20(80px) 기준. 가로·세로 모두 뷰포트 넘지 않는 한 원하는 만큼 확대 */
function getViewportMaxSize() {
  return {
    width: Math.max(MIN_WIDTH, window.innerWidth - 16),
    height: Math.max(MIN_HEIGHT, window.innerHeight - 80),
  };
}

/**
 * 채팅 패널 컴포넌트
 * - 리사이즈 가능 (좌측 상단 핸들)
 * - 헤더 + 메시지 목록 + 입력창
 */
export function ChatPanel() {
  const messages = useChatStore((state) => state.messages);
  const setChatOpen = useChatStore((state) => state.setChatOpen);

  const [size, setSize] = useState(() => {
    const { width: maxW, height: maxH } = getViewportMaxSize();
    return {
      width: Math.min(DEFAULT_WIDTH, maxW),
      height: Math.min(DEFAULT_HEIGHT, maxH),
    };
  });
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { width: maxW, height: maxH } = getViewportMaxSize();
      const newWidth = Math.min(
        maxW,
        Math.max(MIN_WIDTH, window.innerWidth - e.clientX - 16),
      );
      const newHeight = Math.min(
        maxH,
        Math.max(MIN_HEIGHT, window.innerHeight - e.clientY - 80),
      );
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

  // 뷰포트 리사이즈 시 채팅 크기를 뷰포트 안으로 클램프
  useEffect(() => {
    const handleResize = () => {
      const { width: maxW, height: maxH } = getViewportMaxSize();
      setSize((prev) => ({
        width: Math.min(prev.width, maxW),
        height: Math.min(prev.height, maxH),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className="border-border bg-background ring-foreground/10 fixed right-4 bottom-20 z-50 flex flex-col rounded-lg shadow-lg ring-1"
      style={{ width: size.width, height: size.height }}
    >
      {/* 리사이즈 핸들 (좌측 상단) */}
      <div
        onMouseDown={handleMouseDown}
        className="bg-muted/50 hover:bg-muted absolute top-0 left-0 flex h-6 w-6 cursor-nw-resize items-center justify-center rounded-tl-lg rounded-br-lg opacity-0 transition-opacity hover:opacity-100"
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
  );
}
