import { SidebarHeader, Button } from '@codejam/ui';
import { ArrowLeft } from 'lucide-react';

interface ShortcutListProps {
  onBack: () => void;
}

export function ShortcutList({ onBack }: ShortcutListProps) {
  // OS 판별 로직
  const isMac =
    typeof window !== 'undefined' &&
    /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
  const modKey = isMac ? '⌘' : 'Ctrl';

  return (
    <div className="flex h-full flex-col overflow-y-auto px-4 pb-4">
      <SidebarHeader
        title="단축키 안내"
        action={
          <Button variant="ghost" size="icon-xs" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
        }
      />

      <div className="mt-4 flex flex-col gap-6">
        <ShortcutGroup title="사이드바 & 레이아웃">
          <ShortcutRow label="사이드바 토글" keys={[modKey, 'B']} />
          <ShortcutRow label="사이드바 탐색" keys={[modKey, '↑/↓']} />
          <ShortcutRow label="화면 분할 토글" keys={[modKey, '\\']} />
          <ShortcutRow label="스플릿 포커스" keys={[modKey, '1 / 2']} />
        </ShortcutGroup>

        <ShortcutGroup title="에디터 & 탭">
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
      </div>
    </div>
  );
}

function ShortcutGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-muted-foreground px-1 text-[10px] font-bold tracking-wider uppercase">
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ShortcutRow({ label, keys }: { label: string; keys: string[] }) {
  return (
    <div className="flex items-center justify-between px-1 text-xs">
      <span className="text-muted-foreground/90">{label}</span>
      <div className="flex gap-1.5">
        {keys.map((k) => (
          <kbd
            key={k}
            className="bg-muted/50 border-border/40 flex min-w-[24px] items-center justify-center rounded border px-1.5 py-0.5 font-sans text-[10px] font-medium shadow-sm"
          >
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}
