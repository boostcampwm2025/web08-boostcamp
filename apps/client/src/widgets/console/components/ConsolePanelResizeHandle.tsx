import { GripVertical } from 'lucide-react';

interface ConsolePanelResizeHandleProps {
  isResizing: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

export function ConsolePanelResizeHandle({
  isResizing,
  onMouseDown,
}: ConsolePanelResizeHandleProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="bg-muted/30 hover:bg-primary/20 absolute top-0 left-0 z-10 h-full w-1 cursor-ew-resize transition-all"
      style={{
        backgroundColor: isResizing ? 'rgba(59, 130, 246, 0.3)' : undefined,
      }}
      title="드래그하여 너비 조절"
    >
      <div className="absolute top-1/2 left-0 flex h-16 w-4 -translate-x-1.5 -translate-y-1/2 items-center justify-center">
        <GripVertical className="text-muted-foreground h-4 w-4 opacity-0 transition-opacity hover:opacity-100" />
      </div>
    </div>
  );
}
