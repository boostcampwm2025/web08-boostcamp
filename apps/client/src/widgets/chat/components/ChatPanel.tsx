import { Rnd, type ResizeEnable } from 'react-rnd';
import { useChatStore } from '@/stores/chat';
import { Button } from '@codejam/ui';
import { X } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { ChatInput } from './ChatInput';

const MIN_WIDTH = 280;
const MIN_HEIGHT = 200;
const DEFAULT_WIDTH = 340;
const DEFAULT_HEIGHT = 380;
const MARGIN_RIGHT = 16;
const MARGIN_BOTTOM = 80;

const DRAG_HANDLE_CLASSNAME = 'chat-drag-handle';
const ENABLE_RESIZING: ResizeEnable = {
  top: true,
  right: true,
  bottom: true,
  left: true,
  topRight: true,
  bottomRight: true,
  bottomLeft: true,
  topLeft: true,
};

/** right-4(16px), bottom-20(80px) 기준. 가로·세로 모두 뷰포트 넘지 않는 한 원하는 만큼 확대 */
function getViewportMaxSize() {
  const width = Math.max(MIN_WIDTH, window.innerWidth - MARGIN_RIGHT);
  const height = Math.max(MIN_HEIGHT, window.innerHeight - MARGIN_BOTTOM);
  return { width, height };
}

/**
 * 채팅 패널 컴포넌트
 * - 드래그 및 리사이즈 가능
 * - 헤더 + 메시지 목록 + 입력창
 */
export function ChatPanel() {
  const { width: maxW, height: maxH } = getViewportMaxSize();

  return (
    <Rnd
      default={{
        x: window.innerWidth - DEFAULT_WIDTH - MARGIN_RIGHT,
        y: window.innerHeight - DEFAULT_HEIGHT - MARGIN_BOTTOM,
        width: Math.min(DEFAULT_WIDTH, maxW),
        height: Math.min(DEFAULT_HEIGHT, maxH),
      }}
      minWidth={MIN_WIDTH}
      minHeight={MIN_HEIGHT}
      bounds="window"
      dragHandleClassName={DRAG_HANDLE_CLASSNAME}
      cancel=".no-drag"
      enableResizing={ENABLE_RESIZING}
      className="z-50"
    >
      <div className="border-border bg-background ring-foreground/10 flex h-full w-full flex-col overflow-hidden rounded-lg shadow-lg ring-1">
        <ChatHeader />
        <ChatMessages />
        <ChatInput />
      </div>
    </Rnd>
  );
}

function ChatHeader() {
  const setChatOpen = useChatStore((state) => state.setChatOpen);

  return (
    <div
      className={`${DRAG_HANDLE_CLASSNAME} border-border flex shrink-0 cursor-move items-center justify-between border-b px-3 py-2`}
    >
      <span className="text-foreground text-sm font-medium">채팅</span>

      <Button
        variant="ghost"
        size="icon-xs"
        className="no-drag"
        onClick={() => setChatOpen(false)}
        aria-label="채팅 닫기"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

function ChatMessages() {
  const messages = useChatStore((state) => state.messages);

  return (
    <div className="min-h-0 flex-1">
      <ChatWindow messages={messages} />
    </div>
  );
}
