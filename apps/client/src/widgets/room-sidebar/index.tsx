import { useState } from 'react';
import type { SidebarTab } from './lib/types';
import { cn } from '@codejam/ui';
import { Participants } from '@/widgets/participants';
import { FileList } from '@/widgets/files';

export function RoomSidebar({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('FILES');

  const toggleTab = (tab: SidebarTab) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  return (
    <div className={cn('flex h-full shrink-0', className)}>
      <nav></nav>
      <aside
        className={cn(
          'border-border over-flow-hidden flex flex-col border-r',
          activeTab ? 'w-72 opacity-100' : 'w-0 border-r-0 opacity-0',
        )}
      >
        <div className="h-full w-72 min-w-[18rem]">
          {activeTab === 'PARTICIPANTS' && (
            <div className="h-full py-2">
              <Participants />
            </div>
          )}

          {activeTab === 'FILES' && (
            <div className="h-full py-2">
              <FileList />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
