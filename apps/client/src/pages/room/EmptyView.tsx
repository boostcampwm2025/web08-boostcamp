type EmptyViewProps = {
  deleted?: boolean;
};

function ShortcutRow({ label, keys }: { label: string; keys: string[] }) {
  return (
    <div className="hover:bg-muted flex items-center justify-between rounded-sm px-3 py-2 text-sm">
      <span className="text-muted-foreground/90">{label}</span>
      <div className="flex gap-1.5">
        {keys.map((k, idx) => (
          <kbd
            key={idx}
            className="bg-muted/50 border-border/40 flex min-w-6 items-center justify-center rounded border px-2 py-1 font-sans text-xs font-medium shadow-sm"
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
    <div className="flex h-screen items-center justify-center p-4">
      <div className="w-full max-w-[600px] text-center">
        <h2 className="mb-2 text-xl font-semibold text-gray-800 sm:text-2xl dark:text-gray-100">
          {deleted ? '해당 파일은 삭제되었습니다' : '열린 파일이 없습니다'}
        </h2>
        <p className="mb-6 text-sm text-gray-500 sm:mb-8 dark:text-gray-400">
          {deleted
            ? '탭을 닫고 새로운 파일 탭을 열어주세요'
            : '아래 단축키를 사용하여 시작하세요'}
        </p>

        <div className="bg-card border-border mx-auto rounded-xl border p-4 shadow-lg sm:p-6">
          <div className="space-y-1">
            <ShortcutRow label="파일 열기" keys={[modKey, 'O']} />
            <ShortcutRow label="단축키 가이드" keys={[modKey, 'Shift', 'P']} />
          </div>
        </div>

        <p className="text-muted-foreground mt-4 text-xs sm:mt-6">
          협업을 시작하려면 파일을 열거나 생성해주세요
        </p>
      </div>
    </div>
  );
}
