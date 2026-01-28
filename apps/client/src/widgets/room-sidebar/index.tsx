import { useMemo, useState } from 'react';
import type { SidebarTab } from './lib/types';
import { cn } from '@codejam/ui';
import { Participants } from '@/widgets/participants';
import { FileList } from '@/widgets/files';
import { SidebarButton } from './components/SidebarButton';
import { FolderOpen, Users } from 'lucide-react';

export function RoomSidebar({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('FILES');

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
      <nav className="z-0 my-4 flex w-12 flex-col items-center gap-2 border-r">
        {tabs.map((tab) => (
          <SidebarButton
            isActive={activeTab === tab.id}
            onClick={() => toggleTab(tab.id)}
            icon={tab.icon}
            label={tab.label}
          />
        ))}
      </nav>
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
