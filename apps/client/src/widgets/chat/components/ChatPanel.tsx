import { useState, useEffect } from 'react';
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

function getViewportMaxSize() {
  const width = Math.max(MIN_WIDTH, window.innerWidth - MARGIN_RIGHT);
  const height = Math.max(MIN_HEIGHT, window.innerHeight - MARGIN_BOTTOM);
  return { width, height };
}

/**
 * 드래그 중 이벤트를 차단하는 오버레이
 * Rnd 컴포넌트보다 뒤에 위치 (z-index)
 * 채팅 패널은 보이지만 하위 요소와의 상호작용을 차단
 */
function DragOverlay({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;

  return (
    <div
      className="fixed inset-0 z-40"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{ cursor: 'move' }}
    />
  );
}

/**
 * 채팅 패널 컴포넌트
 * - 드래그 및 리사이즈 가능
 * - 헤더 + 메시지 목록 + 입력창
 */
export function ChatPanel() {
  const { width: maxW, height: maxH } = getViewportMaxSize();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <>
      <DragOverlay isActive={isDragging} />

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
        onDragStart={() => setIsDragging(true)}
        onDragStop={() => setIsDragging(false)}
        className="z-50"
      >
        <div className="border-border bg-background ring-foreground/10 flex h-full w-full flex-col overflow-hidden rounded-lg shadow-lg ring-1">
          <ChatHeader />
          <ChatMessages />
          <div className="no-drag">
            <ChatInput />
          </div>
        </div>
      </Rnd>
    </>
  );
}

function ChatHeader() {
  const setChatOpen = useChatStore((state) => state.setChatOpen);

  return (
    <div
      className={`${DRAG_HANDLE_CLASSNAME} border-border flex shrink-0 cursor-move items-center justify-between border-b px-3 py-2`}
    >
      <span className="text-foreground text-sm font-medium select-none">
        채팅
      </span>

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
    <div className="min-h-0 flex-1 select-none">
      <ChatWindow messages={messages} />
    </div>
  );
}
