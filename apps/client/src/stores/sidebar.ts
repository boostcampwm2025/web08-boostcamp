import { create } from 'zustand';
import { type SidebarTab } from '@/widgets/room-sidebar/lib/types';
import { useThemeStore } from '@/shared/lib/hooks/useDarkMode';

interface SidebarState {
  activeSidebarTab: SidebarTab | null;
  setActiveSidebarTab: (tab: SidebarTab | null) => void;
  toggleSidebarTab: (tab: SidebarTab) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  activeSidebarTab: null,
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
  toggleSidebarTab: (tab) => {
    // 이스터 에그 카운터 증가
    useThemeStore.getState().incrementSidebarToggle();

    set((state) => ({
      activeSidebarTab: state.activeSidebarTab === tab ? null : tab,
    }));
  },
}));
