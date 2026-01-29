import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/stores/chat';
import { SystemMessage } from './SystemMessage';
import { UserMessage } from './UserMessage';

type ChatWindowProps = {
  messages: ChatMessage[];
};

/**
 * 플로팅 채팅창 본문
 * - 메시지 목록 표시
 * - 새 메시지 시 하단으로 자동 스크롤
 */
export function ChatWindow({ messages }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages.length]);

  return (
    <div
      ref={scrollRef}
      className="scrollbar-thin flex max-h-[280px] min-h-[120px] flex-col gap-1 overflow-y-auto px-3 py-2"
    >
      {messages.length === 0 ? (
        <div className="text-muted-foreground flex flex-1 items-center justify-center text-xs">
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
  );
}
