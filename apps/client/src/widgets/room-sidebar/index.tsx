import { useState } from 'react';
import type { SidebarTab } from './lib/types';
import { cn } from '@codejam/ui';
import { Participants } from '@/widgets/participants';
import { FileList } from '@/widgets/files';
import { SidebarButton } from './components/SidebarButton';
import { MoreTabContent } from './components/MoreTabContent';
import { SIDEBAR_TABS } from './lib/sidebar-data';
import { SidebarProfile } from './components/SidebarProfile';
import { SidebarPanel } from './components/SidebarPanel';

export function RoomSidebar({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('PARTICIPANTS');

  const toggleTab = (tab: SidebarTab) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  const isOpen = activeTab !== null;

  return (
    <div className={cn('flex h-full shrink-0', className)}>
      <nav className="bg-muted/10 z-10 flex w-[72px] flex-col items-center gap-2 border-r py-4">
        {SIDEBAR_TABS.map((tab) => (
          <SidebarButton
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => toggleTab(tab.id)}
            icon={tab.icon}
            label={tab.label}
          />
        ))}

        <div className="mt-auto flex w-full flex-col items-center gap-3">
          <SidebarProfile />
          <div className="h-1" />
        </div>
      </nav>
      <SidebarPanel isOpen={isOpen}>
        {activeTab === 'PARTICIPANTS' && <Participants />}
        {activeTab === 'FILES' && <FileList />}
        {activeTab === 'MORE' && <MoreTabContent />}
      </SidebarPanel>
    </div>
  );
}
