import { useShortcutStore } from '@/stores/shortcut';
import { ShortcutListContent } from './ShortcutListContent';

export function ShortcutHUD() {
  const isHUDOpen = useShortcutStore((state) => state.isHUDOpen);

  if (!isHUDOpen) return null;

  return (
    <div className="bg-background/60 animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md duration-200">
      <div className="bg-card border-border animate-in zoom-in-95 w-[760px] rounded-3xl border p-8 shadow-2xl duration-150">
        <div className="mb-8 flex items-end justify-between border-b pb-4">
          <h2 className="text-2xl font-bold tracking-tight">Quick Shortcuts</h2>
          <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
            CodeJam IDE Guide
          </span>
        </div>

        <ShortcutListContent className="grid grid-cols-2 gap-x-12 gap-y-8" />

        <div className="mt-10 flex items-center justify-center gap-2 border-t pt-6">
          <p className="text-muted-foreground text-xs font-medium">
            누르고 있는 키를 떼면 창이 닫힙니다
          </p>
        </div>
      </div>
    </div>
  );
}
