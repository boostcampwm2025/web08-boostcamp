import { MessageCircle } from 'lucide-react';
import { Button } from '@codejam/ui';

type ChatIconProps = {
  unreadCount: number;
  onClick: () => void;
};

/**
 * 플로팅 채팅 아이콘 버튼
 * - 우측 하단 고정 위치
 * - 읽지 않은 메시지 배지 표시
 */
export function ChatIcon({ unreadCount, onClick }: ChatIconProps) {
  return (
    <div className="fixed right-4 bottom-4 z-50">
      <Button
        onClick={onClick}
        size="icon-lg"
        className="relative h-14 w-14 rounded-full shadow-lg"
        aria-label="채팅 열기"
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="bg-destructive absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>
    </div>
  );
}
