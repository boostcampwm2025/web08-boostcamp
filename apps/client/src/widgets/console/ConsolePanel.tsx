import { Activity } from 'react';
import { useConsoleResize } from './hooks/useConsoleResize';
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
  const { width, isResizing, isCollapsed, handleMouseDown } = useConsoleResize({
    minWidth: MIN_WIDTH,
    maxWidth: MAX_WIDTH,
    defaultWidth: DEFAULT_WIDTH,
  });

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
