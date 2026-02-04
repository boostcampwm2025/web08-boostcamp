import { useState } from 'react';
import { cn, SidebarHeader } from '@codejam/ui';
import { MORE_MENU_ITEMS } from '../lib/sidebar-data';
import { ExternalLink } from 'lucide-react';
import { ShortcutList } from './ShortcutList';

export function MoreTabContent() {
  const [activeAction, setActiveAction] = useState<string | null>(null);

  if (activeAction === 'shortcuts') {
    return <ShortcutList onBack={() => setActiveAction(null)} />;
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto px-4 pb-4">
      <SidebarHeader title="더보기" />

      <div className="mt-4 flex flex-col gap-2">
        {MORE_MENU_ITEMS.map((item) => {
          const isLink = item.type === 'link';
          const innerContent = (
            <>
              <div className="text-muted-foreground group-hover:text-foreground flex items-center gap-3">
                <item.icon size={20} />
                <span>{item.label}</span>
              </div>
              {isLink && (
                <ExternalLink
                  size={14}
                  className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                />
              )}
            </>
          );

          const baseStyle = cn(
            'group bg-muted/30 hover:border-border hover:bg-card',
            'flex w-full items-center justify-between rounded-lg border border-transparent',
            'p-3 text-sm font-medium transition-all hover:shadow-sm text-left',
          );

          return isLink ? (
            <a
              key={item.key}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={baseStyle}
            >
              {innerContent}
            </a>
          ) : (
            <button
              key={item.key}
              onClick={() => setActiveAction(item.key)}
              className={baseStyle}
            >
              {innerContent}
            </button>
          );
        })}
      </div>
    </div>
  );
}
