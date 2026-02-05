import { Activity } from 'react';
import { useEffect, useRef } from 'react';
import { useCodeExecutionStore } from '@/stores/code-execution';
import { useConsoleStore } from '@/stores/console';
import { useConsolePanelResize } from './hooks/useConsolePanelResize';
import { ConsolePanelHeader } from './components/ConsolePanelHeader';
import { ConsolePanelContent } from './components/ConsolePanelContent';
import { ConsolePanelResizeHandle } from './components/ConsolePanelResizeHandle';
import { cn } from '@codejam/ui';

export function ConsolePanel({ variant }: { variant: 'light' | 'dark' }) {
  const { toggleConsole } = useConsoleStore();
  const { width, isResizing, isCollapsed, handleMouseDown } =
    useConsolePanelResize({
      minWidth: 60,
      maxWidth: 600,
      defaultWidth: 384,
    });

  const isExecuting = useCodeExecutionStore((state) => state.isExecuting);
  const prevIsExecutingRef = useRef(false);

  useEffect(() => {
    const wasExecuting = prevIsExecutingRef.current;
    if (!wasExecuting && isExecuting && isCollapsed) {
      toggleConsole();
    }
    prevIsExecutingRef.current = isExecuting;
  }, [isExecuting, isCollapsed, toggleConsole]);

  return (
    <div
      className={cn(
        'bg-background relative h-full shrink-0 overflow-visible transition-[width] duration-300 ease-in-out',
        isResizing && 'transition-none',
      )}
      style={{ width: isCollapsed ? 0 : width }}
    >
      <ConsolePanelResizeHandle
        isResizing={isResizing}
        isCollapsed={isCollapsed}
        onMouseDown={handleMouseDown}
        onToggle={toggleConsole}
      />

      <Activity mode={isCollapsed ? 'hidden' : 'visible'}>
        <div
          className={cn(
            'border-border flex h-full w-full flex-col border-l',
            isCollapsed && 'invisible',
          )}
        >
          <ConsolePanelHeader />
          <ConsolePanelContent variant={variant} />
        </div>
      </Activity>
    </div>
  );
}
