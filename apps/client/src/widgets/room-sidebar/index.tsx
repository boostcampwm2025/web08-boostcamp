import { useState } from 'react';
import type { SidebarTab } from './lib/types';
import { cn } from '@codejam/ui';
import { Participants } from '@/widgets/participants';
import { FileList } from '@/widgets/files';
import { SidebarButton } from './components/SidebarButton';
import { MoreTabContent } from './components/MoreTabContent';
import { SETTINGS_TAB, SIDEBAR_TABS } from './lib/sidebar-data';
import { SidebarProfile } from './components/SidebarProfile';
import { SidebarPanel } from './components/SidebarPanel';
import { SettingsTabContent } from './components/SettingsTabContent';
import { DoorOpen } from 'lucide-react';
import { LeaveRoomDialog } from '../dialog/LeaveRoomDialog';
import { emitLeftRoom } from '@/stores/socket-events/room';
import { Logo } from './components/Logo';

export function RoomSidebar({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('PARTICIPANTS');
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  const toggleTab = (tab: SidebarTab) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  const isOpen = activeTab !== null;

  return (
    <div className={cn('flex', className)}>
      <nav className="bg-muted/10 z-10 flex w-16 flex-col items-center gap-2 border-r p-4">
        <Logo />

        {SIDEBAR_TABS.map((tab) => (
          <SidebarButton
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => toggleTab(tab.id)}
            icon={tab.icon}
            label={tab.label}
          />
        ))}

        <div className="mt-auto flex w-full flex-col items-center gap-2">
          <SidebarButton
            key={SETTINGS_TAB.id}
            isActive={activeTab === SETTINGS_TAB.id}
            onClick={() => toggleTab(SETTINGS_TAB.id)}
            icon={SETTINGS_TAB.icon}
            label={SETTINGS_TAB.label}
          />
          <SidebarButton
            onClick={() => setIsLeaveDialogOpen(true)}
            icon={<DoorOpen size={22} />}
            label="나가기"
          />

          <div className="h-1" />
          <SidebarProfile />
          <div className="h-1" />
        </div>
      </nav>
      <SidebarPanel isOpen={isOpen}>
        {activeTab === 'PARTICIPANTS' && <Participants />}
        {activeTab === 'FILES' && <FileList />}
        {activeTab === 'MORE' && <MoreTabContent />}
        {activeTab === 'SETTINGS' && <SettingsTabContent />}
      </SidebarPanel>

      <LeaveRoomDialog
        open={isLeaveDialogOpen}
        onOpenChange={setIsLeaveDialogOpen}
        onConfirm={emitLeftRoom}
      />
    </div>
  );
}
