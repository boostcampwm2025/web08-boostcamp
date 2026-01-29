import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { RadixButton as Button, Textarea } from '@codejam/ui';
import { Send } from 'lucide-react';
import { LIMITS } from '@codejam/common';
import { emitChatMessage } from '@/stores/socket-events/chat';

/**
 * 채팅 입력창 컴포넌트
 * - Enter: 전송
 * - Shift+Enter: 줄바꿈
 * - 1~2000자 유효성 검사
 * - 자동 포커스
 */
export function ChatInput() {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 채팅창 열릴 때 자동 포커스
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const trimmedContent = content.trim();
  const isValid =
    trimmedContent.length >= LIMITS.CHAT_MESSAGE_MIN &&
    trimmedContent.length <= LIMITS.CHAT_MESSAGE_MAX;

  const handleSend = () => {
    if (!isValid) return;

    emitChatMessage(content);
    setContent('');

    // 전송 후 포커스 유지
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter: 전송 (Shift 없이)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Shift+Enter: 줄바꿈 (기본 동작 유지)
  };

  return (
    <div className="border-border flex items-end gap-2 border-t px-3 py-2">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="메시지를 입력하세요..."
        maxLength={LIMITS.CHAT_MESSAGE_MAX}
        rows={1}
        className="max-h-[100px] min-h-[36px] flex-1 resize-none"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSend}
        disabled={!isValid}
        className="h-9 w-9 shrink-0"
        title="전송 (Enter)"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
