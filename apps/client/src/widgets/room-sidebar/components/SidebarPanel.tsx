import { cn } from '@codejam/ui';
import type { ReactNode } from 'react';

interface SidebarPanelProps {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
}

export function SidebarPanel({
  isOpen,
  children,
  className,
}: SidebarPanelProps) {
  return (
    <aside
      className={cn(
        'overflow-hidden transition-all duration-300',
        isOpen ? 'm-2 w-72 opacity-100' : 'm-0 w-0 opacity-0',
        isOpen && 'bg-card rounded-xl border shadow-sm',
        className,
      )}
    >
      <div className="h-screen w-72 p-4">{children}</div>
    </aside>
  );
}
