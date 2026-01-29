import { Terminal } from '@/widgets/terminal';

interface ConsolePanelContentProps {
  variant: 'light' | 'dark';
}

export function ConsolePanelContent({ variant }: ConsolePanelContentProps) {
  return (
    <div
      className="flex-1 overflow-hidden"
      style={{ height: 'calc(100% - 42px)' }}
    >
      <Terminal variant={variant} />
    </div>
  );
}
