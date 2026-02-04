import { useCallback } from 'react';
import { useSidebarStore } from '@/stores/sidebar';
import type { SidebarTab } from '@/widgets/room-sidebar/lib/types';

const SIDEBAR_ORDER: SidebarTab[] = [
  'PARTICIPANTS',
  'FILES',
  'MORE',
  'SETTINGS',
];

export function useSidebarNavigation() {
  const { activeSidebarTab, setActiveSidebarTab } = useSidebarStore();

  const handleSidebarSwitch = useCallback(
    (direction: 'next' | 'prev') => {
      const currentIndex = activeSidebarTab
        ? SIDEBAR_ORDER.indexOf(activeSidebarTab)
        : -1;

      let nextIndex;
      if (direction === 'next') {
        nextIndex = (currentIndex + 1) % SIDEBAR_ORDER.length;
      } else {
        nextIndex =
          (currentIndex - 1 + SIDEBAR_ORDER.length) % SIDEBAR_ORDER.length;
      }

      setActiveSidebarTab(SIDEBAR_ORDER[nextIndex]);
    },
    [activeSidebarTab, setActiveSidebarTab],
  );

  return { handleSidebarSwitch };
}
