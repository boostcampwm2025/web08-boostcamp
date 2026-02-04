import { cn, SidebarHeader } from '@codejam/ui';
import { MORE_MENU_ITEMS } from '../lib/sidebar-data';
import { ExternalLink } from 'lucide-react';

export function MoreTabContent() {
  return (
    <div className="flex flex-col gap-4">
      <SidebarHeader title="더보기" />
      <div className="flex flex-col gap-1">
        {MORE_MENU_ITEMS.map((item) => (
          <a
            key={item.key}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'group bg-muted/30 hover:border-border hover:bg-card p-2',
              'flex items-center justify-between rounded-lg border border-transparent',
              'text-sm font-medium transition-all hover:shadow-sm',
            )}
          >
            <div className="text-muted-foreground group-hover:text-foreground flex items-center gap-3">
              <item.icon size={20} />
              <span>{item.label}</span>
            </div>

            <ExternalLink
              size={14}
              className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
