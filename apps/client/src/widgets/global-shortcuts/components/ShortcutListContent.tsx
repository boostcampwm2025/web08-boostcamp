import { ShortcutGroup } from './ShortcutGroup';
import { ShortcutRow } from './ShortcutRow';
import { cn } from '@codejam/ui';

interface ShortcutListContentProps {
  className?: string;
}

export function ShortcutListContent({ className }: ShortcutListContentProps) {
  const isMac =
    typeof window !== 'undefined' &&
    /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
  const modKey = isMac ? '⌘' : 'Ctrl';

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <ShortcutGroup title="사이드바 & 레이아웃">
        <ShortcutRow label="사이드바 토글" keys={[modKey, 'B']} />
        <ShortcutRow label="사이드바 탐색" keys={[modKey, '↑ / ↓']} />
        <ShortcutRow label="화면 분할 토글" keys={[modKey, '\\']} />
        <ShortcutRow label="스플릿 포커스" keys={[modKey, '1 / 2']} />
      </ShortcutGroup>
      <ShortcutGroup title="에디터 & 탭">
        <ShortcutRow label="파일 열기" keys={[modKey, 'O']} />
        <ShortcutRow label="에디터 포커스" keys={[modKey, 'E']} />
        <ShortcutRow label="코드 실행" keys={[modKey, 'Shift', 'R']} />
        <ShortcutRow label="탭 닫기" keys={['Alt', 'W']} />
        <ShortcutRow label="탭 탐색" keys={[modKey, '← / →']} />
        <ShortcutRow label="출력창 토글" keys={[modKey, 'J']} />
        <ShortcutRow label="출력창 토글 (대체)" keys={[modKey, '`']} />
        <ShortcutRow label="필드 포커스 해제" keys={['Esc']} />
      </ShortcutGroup>
      <ShortcutGroup title="협업">
        <ShortcutRow label="채팅창 토글" keys={['/']} />
        <ShortcutRow label="채팅창 토글 (대체)" keys={[modKey, '/']} />
        <ShortcutRow label="채팅 닫기" keys={['Esc']} />
      </ShortcutGroup>
      <ShortcutGroup title="도움말">
        <ShortcutRow label="단축키 가이드" keys={[modKey, 'Shift', 'P']} />
        <ShortcutRow label="다크모드 토글" keys={[modKey, 'Shift', 'D']} />
      </ShortcutGroup>
    </div>
  );
}
