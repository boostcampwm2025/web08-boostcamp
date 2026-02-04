import { Terminal as TerminalIcon } from 'lucide-react';

export function ConsolePanelHeader() {
  return (
    <div className="bg-muted/30 flex items-center justify-between border-b px-4 py-2.5 backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        <TerminalIcon size={14} className="text-muted-foreground" />
        <span className="text-foreground/80 text-xs font-semibold tracking-tight uppercase">
          실행 결과
        </span>
      </div>
    </div>
  );
}
