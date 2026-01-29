import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { MentionsInput, Mention } from 'react-mentions';
import { RadixButton as Button } from '@codejam/ui';
import { Send, FileText } from 'lucide-react';
import { LIMITS } from '@codejam/common';
import { emitChatMessage } from '@/stores/socket-events/chat';
import { useFileNames } from '../hooks/useFileNames';
import './mention.css';

/**
 * 채팅 입력창 컴포넌트
 * - Enter: 전송
 * - Shift+Enter: 줄바꿈
 * - 1~2000자 유효성 검사
 * - 자동 포커스
 * - @로 파일 언급 자동완성
 */
export function ChatInput() {
  const [content, setContent] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileNames = useFileNames();

  // react-mentions용 데이터 형식
  const fileData = fileNames.map((name) => ({ id: name, display: name }));

  // 채팅창 열릴 때 자동 포커스
  useEffect(() => {
    inputRef.current?.focus();
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
    inputRef.current?.focus();
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLTextAreaElement> | KeyboardEvent<HTMLInputElement>,
  ) => {
    // 한글 등 IME 조합 중엔 Enter로 전송하지 않음 (마지막 글자가 따로 전송되는 버그 방지)
    if (e.nativeEvent.isComposing) return;
    // Enter: 전송 (Shift 없이)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Shift+Enter: 줄바꿈 (기본 동작 유지)
  };

  return (
    <div className="border-border flex items-end gap-2 border-t px-3 py-2">
      <MentionsInput
        inputRef={inputRef}
        value={content}
        onChange={(_, newValue) => setContent(newValue)}
        onKeyDown={handleKeyDown}
        placeholder="메시지를 입력하세요... (@로 파일 언급)"
        maxLength={LIMITS.CHAT_MESSAGE_MAX}
        className="mentions-input"
        style={mentionsInputStyle}
      >
        <Mention
          trigger="@"
          data={fileData}
          markup="@[__display__](__id__)"
          displayTransform={(_, display) => `@${display}`}
          className="mention-highlight"
          appendSpaceOnAdd
          renderSuggestion={(_, __, highlightedDisplay) => (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 shrink-0" />
              <span>{highlightedDisplay}</span>
            </div>
          )}
        />
      </MentionsInput>

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

// react-mentions 인라인 스타일 (기본 구조)
const mentionsInputStyle = {
  control: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  highlighter: {
    overflow: 'hidden',
  },
  input: {
    margin: 0,
    overflow: 'auto',
  },
  suggestions: {
    list: {
      maxHeight: 200,
      overflow: 'auto',
    },
  },
};
