import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@codejam/ui';
import { FileQuestion, FileX } from 'lucide-react';

type EmptyViewProps = {
  deleted?: boolean;
};

function ShortcutRow({ label, keys }: { label: string; keys: string[] }) {
  return (
    <div className="hover:bg-muted flex w-full items-center justify-between rounded-sm p-2 text-sm">
      <span className="text-muted-foreground/90">{label}</span>
      <div className="flex gap-1.5">
        {keys.map((k, idx) => (
          <kbd
            key={idx}
            className="bg-muted/50 border-border/40 flex min-w-6 items-center justify-center rounded border font-sans text-xs font-medium shadow-sm"
          >
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}

export function EmptyView({ deleted = false }: EmptyViewProps) {
  const isMac =
    typeof window !== 'undefined' &&
    /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
  const modKey = isMac ? '⌘' : 'Ctrl';

  return (
    <Empty className="bg-background flex h-full items-center justify-center">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {deleted ? <FileX /> : <FileQuestion />}
        </EmptyMedia>
        <EmptyTitle>
          {deleted ? '해당 파일은 삭제되었습니다' : '열린 파일이 없습니다'}
        </EmptyTitle>
        <EmptyDescription>
          {deleted
            ? '탭을 닫고 새로운 파일 탭을 열어주세요'
            : '아래 단축키를 사용하여 시작하세요'}
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent className="bg-card border-border max-w-100 min-w-[320px] rounded-xl border p-4 shadow-lg">
        <ShortcutRow label="파일 열기" keys={[modKey, 'O']} />
        <ShortcutRow label="단축키 가이드" keys={[modKey, 'Shift', 'P']} />
      </EmptyContent>
      {!deleted && (
        <p className="text-muted-foreground text-xs">
          협업을 시작하려면 파일을 열거나 생성해주세요
        </p>
      )}
    </Empty>
  );
}
