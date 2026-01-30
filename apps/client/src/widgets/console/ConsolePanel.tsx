import { Activity } from 'react';
import { useEffect, useRef } from 'react';
import { useCodeExecutionStore } from '@/stores/code-execution';
import { useConsolePanelResize } from './hooks/useConsolePanelResize';
import { ConsolePanelHeader } from './components/ConsolePanelHeader';
import { ConsolePanelContent } from './components/ConsolePanelContent';
import { ConsolePanelResizeHandle } from './components/ConsolePanelResizeHandle';

const MIN_WIDTH = 60;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 384;

interface ConsolePanelProps {
  variant: 'light' | 'dark';
}

export function ConsolePanel({ variant }: ConsolePanelProps) {
  const { width, isResizing, isCollapsed, handleMouseDown, handleExpand } =
    useConsolePanelResize({
      minWidth: MIN_WIDTH,
      maxWidth: MAX_WIDTH,
      defaultWidth: DEFAULT_WIDTH,
    });

  const isExecuting = useCodeExecutionStore((state) => state.isExecuting);
  const prevIsExecutingRef = useRef(false);

  // Expand console when execution starts while collapsed
  useEffect(() => {
    const wasExecuting = prevIsExecutingRef.current;
    const executionStarting = !wasExecuting && isExecuting;

    if (executionStarting && isCollapsed) handleExpand();
    prevIsExecutingRef.current = isExecuting;
  }, [isExecuting, isCollapsed, handleExpand]);

  return (
    <div
      className="border-border relative h-full shrink-0 border-l"
      style={{ width }}
    >
      <ConsolePanelResizeHandle
        isResizing={isResizing}
        onMouseDown={handleMouseDown}
      />

      <Activity mode={isCollapsed ? 'hidden' : 'visible'}>
        <ConsolePanelHeader />
        <ConsolePanelContent variant={variant} />
      </Activity>
    </div>
  );
}
