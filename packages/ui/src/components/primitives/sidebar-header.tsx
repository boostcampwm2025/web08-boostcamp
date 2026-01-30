import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface SidebarHeaderProps {
  title: string;
  count?: number;
  action?: ReactNode;
  className?: string;
}

export function SidebarHeader({
  title,
  count,
  action,
  className,
}: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        '-mx-4 flex min-h-[48px] items-center justify-between px-4 py-3',
        className,
      )}
    >
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
        <h2 className="text-sm font-bold tracking-wide uppercase">{title}</h2>
        {count !== undefined && (
          <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
            {count}
          </span>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
