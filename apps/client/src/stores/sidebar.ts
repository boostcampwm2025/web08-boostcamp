import { create } from 'zustand';
import { type SidebarTab } from '@/widgets/room-sidebar/lib/types';

interface SidebarState {
  activeSidebarTab: SidebarTab | null;
  setActiveSidebarTab: (tab: SidebarTab | null) => void;
  toggleSidebarTab: (tab: SidebarTab) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  activeSidebarTab: null,
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
  toggleSidebarTab: (tab) =>
    set((state) => ({
      activeSidebarTab: state.activeSidebarTab === tab ? null : tab,
    })),
}));
