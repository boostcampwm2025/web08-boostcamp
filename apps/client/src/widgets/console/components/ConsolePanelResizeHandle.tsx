// widgets/console/components/ConsolePanelResizeHandle.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@codejam/ui';

interface ConsolePanelResizeHandleProps {
  isResizing: boolean;
  isCollapsed: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onToggle: () => void;
}

export function ConsolePanelResizeHandle({
  isResizing,
  isCollapsed,
  onMouseDown,
  onToggle,
}: ConsolePanelResizeHandleProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      className={cn(
        'group absolute inset-y-0 -left-2 z-[40] flex w-4 cursor-ew-resize items-center justify-center',
        isResizing && 'bg-transparent',
      )}
    >
      <div
        className={cn(
          'absolute right-[7px] z-[41] h-full w-[1px] transition-colors',
          isResizing ? 'bg-primary/30 w-[1.5px]' : 'bg-border/60',
        )}
      />

      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
        className={cn(
          'absolute z-[42] flex h-10 w-4 cursor-pointer items-center justify-center rounded-sm border border-white/20 shadow-sm backdrop-blur-md transition-all',
          'text-muted-foreground hover:text-primary bg-white/20 hover:bg-white/40',
          'dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10',
          'opacity-100',
          isCollapsed ? '-left-[8px] shadow-none' : '-left-[2px]',
          isResizing ? 'pointer-events-none opacity-0' : 'opacity-100',
        )}
      >
        {isCollapsed ? (
          <ChevronLeft
            size={13}
            strokeWidth={2.5}
            className="translate-x-[0.5px]"
          />
        ) : (
          <ChevronRight size={13} strokeWidth={2} />
        )}
      </button>
    </div>
  );
}
