import {
  useState,
  useRef,
  useEffect,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react';
import { RadixButton as Button, Textarea } from '@codejam/ui';
import { Send, FileText } from 'lucide-react';
import { LIMITS } from '@codejam/common';
import { emitChatMessage } from '@/stores/socket-events/chat';
import { useFileNames } from '../hooks/useFileNames';

/**
 * 채팅 입력창 컴포넌트
 * - Enter: 전송
 * - Shift+Enter: 줄바꿈
 * - 1~2000자 유효성 검사
 * - 자동 포커스
 * - @로 파일 언급 자동완성 (Popover)
 */
export function ChatInput() {
  const [content, setContent] = useState('');
  const [mentionState, setMentionState] = useState<{
    isOpen: boolean;
    query: string;
    startIndex: number;
  }>({ isOpen: false, query: '', startIndex: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileNames = useFileNames();

  // 채팅창 열릴 때 자동 포커스
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // 필터링된 파일 목록
  const filteredFiles = fileNames.filter((name) =>
    name.toLowerCase().includes(mentionState.query.toLowerCase()),
  );

  // 선택 인덱스 리셋
  useEffect(() => {
    setSelectedIndex(0);
  }, [mentionState.query]);

  const trimmedContent = content.trim();
  const isValid =
    trimmedContent.length >= LIMITS.CHAT_MESSAGE_MIN &&
    trimmedContent.length <= LIMITS.CHAT_MESSAGE_MAX;

  const handleSend = () => {
    if (!isValid) return;

    emitChatMessage(content);
    setContent('');
    setMentionState({ isOpen: false, query: '', startIndex: 0 });

    textareaRef.current?.focus();
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);

    // 마지막 @ 찾기
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const afterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // @ 이후에 공백이 없으면 검색 중
      if (!afterAt.includes(' ') && !afterAt.includes('\n')) {
        setMentionState({
          isOpen: true,
          query: afterAt,
          startIndex: lastAtIndex,
        });
        return;
      }
    }

    setMentionState({ isOpen: false, query: '', startIndex: 0 });
  };

  const handleSelectFile = (fileName: string) => {
    const before = content.slice(0, mentionState.startIndex);
    const after = content.slice(
      mentionState.startIndex + 1 + mentionState.query.length,
    );

    // @[fileName](fileName) 규약으로 삽입
    setContent(`${before}@[${fileName}](${fileName}) ${after}`);
    setMentionState({ isOpen: false, query: '', startIndex: 0 });
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // 한글 등 IME 조합 중엔 무시
    if (e.nativeEvent.isComposing) return;

    // Popover 열려있을 때 키보드 네비게이션
    if (mentionState.isOpen && filteredFiles.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, filteredFiles.length - 1));
          return;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          return;
        case 'Enter':
          e.preventDefault();
          handleSelectFile(filteredFiles[selectedIndex]);
          return;
        case 'Escape':
          e.preventDefault();
          setMentionState({ isOpen: false, query: '', startIndex: 0 });
          return;
      }
    }

    // Enter: 전송 (Shift 없이)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-border relative flex items-end gap-2 border-t px-3 py-2">
      {/* 파일 선택 Popover */}
      {mentionState.isOpen && filteredFiles.length > 0 && (
        <div className="border-border bg-popover absolute bottom-full left-3 mb-1 w-64 rounded-lg border p-1 shadow-lg">
          {filteredFiles.slice(0, 8).map((fileName, index) => (
            <button
              key={fileName}
              onClick={() => handleSelectFile(fileName)}
              className={`text-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                index === selectedIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50'
              }`}
            >
              <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
              {fileName}
            </button>
          ))}
        </div>
      )}

      <Textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="메시지를 입력하세요... (@로 파일 언급)"
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
