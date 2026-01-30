import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ChatMessage } from '@/stores/chat';
import { SystemMessage } from './SystemMessage';
import { UserMessage } from './UserMessage';

type ChatWindowProps = {
  messages: ChatMessage[];
};

/** 스크롤이 맨 아래로부터 이 픽셀 이내면 "맨 아래"로 간주 */
const SCROLL_THRESHOLD = 50;

/**
 * 플로팅 채팅창 본문
 * - 메시지 목록 표시
 * - 맨 아래일 때만 자동 스크롤
 * - 위쪽 보고 있으면 "새 메시지" 버튼 표시
 */
export function ChatWindow({ messages }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const prevMessagesLengthRef = useRef(messages.length);

  // 스크롤이 맨 아래인지 확인
  const checkIsAtBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD;
  }, []);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    const atBottom = checkIsAtBottom();
    setIsAtBottom(atBottom);
    if (atBottom) {
      setHasNewMessage(false);
    }
  }, [checkIsAtBottom]);

  // 맨 아래로 스크롤
  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
    setHasNewMessage(false);
  }, []);

  // 새 메시지 도착 시 처리 (setState는 다음 틱으로 지연해 cascading render 방지)
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      const wasAtBottom = isAtBottom;
      if (wasAtBottom) {
        queueMicrotask(() => scrollToBottom());
      } else {
        queueMicrotask(() => setHasNewMessage(true));
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length, isAtBottom, scrollToBottom]);

  // 최초 렌더링 시 맨 아래로 스크롤
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
    });
  }, []);

  return (
    <div className="relative h-full">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="scrollbar-thin absolute inset-0 flex flex-col gap-1 overflow-y-auto px-3 py-2"
      >
        {messages.length === 0 ? (
          <div className="text-muted-foreground flex min-h-full flex-1 items-center justify-center text-xs">
            메시지가 여기에 표시됩니다.
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.type === 'system') {
              return <SystemMessage key={msg.id} message={msg.message} />;
            }
            return <UserMessage key={msg.id} message={msg} />;
          })
        )}
      </div>

      {/* 새 메시지 버튼 */}
      {hasNewMessage && (
        <button
          onClick={scrollToBottom}
          className="bg-primary text-primary-foreground hover:bg-primary/90 absolute bottom-2 left-1/2 flex -translate-x-1/2 items-baseline gap-1 rounded-full px-3 py-1.5 text-xs font-medium shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
        >
          새 메시지
          <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
        </button>
      )}
    </div>
  );
}
