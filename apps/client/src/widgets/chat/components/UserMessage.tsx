import { useMemo } from 'react';
import { createAvatarGenerator, AvvvatarsProvider, Button } from '@codejam/ui';
import { RotateCcw, X } from 'lucide-react';
import type { UserMessage as UserMessageType } from '@/stores/chat';
import { useRoomStore } from '@/stores/room';
import { useChatStore } from '@/stores/chat';
import { emitChatMessage } from '@/stores/socket-events/chat';
import { MarkdownContent } from './MarkdownContent';
import { FileMention } from './FileMention';
import { parseFileMentions } from '../lib/parseFileMentions';

const provider = new AvvvatarsProvider({ variant: 'shape' });
const { Avatar } = createAvatarGenerator(provider);

type UserMessageProps = {
  message: UserMessageType;
};

/**
 * 시간 포맷팅 (10:32 AM 형식)
 */
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * 사용자 채팅 메시지 컴포넌트
 * - 아바타 + 닉네임#해시 + 시간
 * - 메시지 내용
 * - 내 메시지는 배경색 강조
 * - 전송 실패 시 재전송/삭제 버튼
 */
export function UserMessage({ message }: UserMessageProps) {
  const { pt, content, createdAt, status, id } = message;
  const myPtId = useRoomStore((state) => state.myPtId);
  const removeMessage = useChatStore((state) => state.removeMessage);

  const isMyMessage = pt.ptId === myPtId;

  // content를 세그먼트로 파싱 (파일 언급 + 텍스트)
  const segments = useMemo(() => parseFileMentions(content), [content]);

  const handleResend = () => {
    // 기존 메시지 삭제 후 재전송
    removeMessage(id);
    emitChatMessage(content);
  };

  const handleDelete = () => {
    removeMessage(id);
  };

  return (
    <div
      className={`flex gap-2 rounded-md px-2 py-1.5 ${
        isMyMessage ? 'bg-primary/10' : ''
      } ${status === 'sending' ? 'opacity-60' : ''}`}
    >
      {/* 아바타 */}
      <div className="shrink-0 pt-0.5">
        <Avatar id={pt.ptHash} size={28} />
      </div>

      {/* 메시지 내용 */}
      <div className="min-w-0 flex-1">
        {/* 닉네임 + 해시 + 시간 */}
        <div className="flex items-baseline gap-1">
          <span className="text-foreground text-xs font-medium">
            {pt.nickname}
          </span>
          <span className="text-muted-foreground/70 text-xs">#{pt.ptHash}</span>
          <span className="text-muted-foreground/50 text-[10px]">
            · {formatTime(createdAt)}
          </span>
        </div>

        {/* 메시지 텍스트 (파일 언급 + 마크다운 렌더링) */}
        <div className="mt-0.5 leading-relaxed">
          {segments.map((seg, i) =>
            seg.type === 'file' ? (
              <FileMention key={i} fileName={seg.fileName} />
            ) : (
              <MarkdownContent key={i} content={seg.text} />
            ),
          )}
        </div>

        {/* 전송 실패 시 재전송/삭제 버튼 */}
        {status === 'failed' && (
          <div className="mt-1 flex items-center gap-1">
            <span className="text-destructive text-[10px]">전송 실패</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={handleResend}
              title="재전송"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={handleDelete}
              title="삭제"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
