import { useMemo, useState } from 'react';
import type { SidebarTab } from './lib/types';
import { cn } from '@codejam/ui';
import { Participants } from '@/widgets/participants';
import { FileList } from '@/widgets/files';
import { SidebarButton } from './components/SidebarButton';
import { FolderOpen, Users } from 'lucide-react';

export function RoomSidebar({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('PARTICIPANTS');

  const toggleTab = (tab: SidebarTab) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  const tabs = useMemo(
    () => [
      {
        id: 'PARTICIPANTS' as SidebarTab,

        icon: <Users size={20} />,

        label: '참가자 목록',
      },

      {
        id: 'FILES' as SidebarTab,

        icon: <FolderOpen size={20} />,

        label: '파일 목록',
      },
    ],

    [],
  );

  return (
    <div className={cn('flex h-full shrink-0', className)}>
      <nav className="z-10 flex w-12 flex-col items-center gap-2 border-r py-4">
        {tabs.map((tab) => (
          <SidebarButton
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => toggleTab(tab.id)}
            icon={tab.icon}
            label={tab.label}
          />
        ))}
      </nav>
      <aside
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          activeTab ? 'my-2 mr-2 ml-2 w-72 opacity-100' : 'm-0 w-0 opacity-0',
          activeTab && 'border-border bg-card rounded-xl border shadow-sm',
        )}
      >
        <div className="h-full w-72 min-w-[18rem]">
          {activeTab === 'PARTICIPANTS' && (
            <div className="h-full py-3">
              <Participants />
            </div>
          )}

          {activeTab === 'FILES' && (
            <div className="h-full py-3">
              <FileList />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
