import { useCallback, useContext } from 'react';
import { ActiveTabContext } from '@/contexts/TabProvider';
import { LinearTabApiContext } from '@/contexts/ProviderAPI';
import { useGlobalShortcuts } from '@/shared/lib/hooks/useGlobalShortcuts';
import { useFileStore } from '@/stores/file';
import { useSidebarStore } from '@/stores/sidebar';
import type { SidebarTab } from '@/widgets/room-sidebar/lib/types';
import { useConsoleStore } from '@/stores/console';

const SIDEBAR_ORDER: SidebarTab[] = [
  'PARTICIPANTS',
  'FILES',
  'MORE',
  'SETTINGS',
];

export function GlobalShortcutHandler() {
  const { activeTab, setActiveTab } = useContext(ActiveTabContext);
  const { takeTab, removeLinear, deleteLinearTab, tabKeys } =
    useContext(LinearTabApiContext);
  const setActiveFileId = useFileStore((state) => state.setActiveFile);
  const { activeSidebarTab, toggleSidebarTab, setActiveSidebarTab } =
    useSidebarStore();
  const { toggleConsole } = useConsoleStore();

  // Sidebar 위아래로 탭 전환
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

  // File Tab 죄우로 전환
  const handleTabSwitch = useCallback(
    (direction: 'next' | 'prev') => {
      const currentLinearKey = activeTab.active;
      const fileTabMap = takeTab(currentLinearKey);
      if (!fileTabMap) return;

      const fileIds = Object.keys(fileTabMap);
      const currentFileId = activeTab[currentLinearKey];
      const currentIndex = fileIds.indexOf(currentFileId);
      if (currentIndex === -1) return;

      const nextIndex =
        direction === 'next'
          ? (currentIndex + 1) % fileIds.length
          : (currentIndex - 1 + fileIds.length) % fileIds.length;

      setActiveTab(currentLinearKey, fileIds[nextIndex]);
    },
    [activeTab, setActiveTab, takeTab],
  );

  // File Tan 삭제
  const handleCloseActiveTab = useCallback(() => {
    const tabKey = activeTab.active; // 현재 활성화된 레이아웃(Split) 키
    const fileId = activeTab[tabKey]; // 해당 레이아웃에서 선택된 파일 ID

    if (!fileId) return;

    // 현재 레이아웃에 포함된 파일 목록 확인
    const currentFilesMap = takeTab(tabKey);
    const fileIds = Object.keys(currentFilesMap || {});
    const totalSplits = tabKeys().length;

    // 삭제 후 활성화할 인접 탭 계산
    let nextActiveId: string | null = null;
    if (fileIds.length > 1) {
      const currentIndex = fileIds.indexOf(fileId);
      // 현재 탭이 첫 번째가 아니면 왼쪽(index-1), 첫 번째면 오른쪽(index 1) 선택
      const nextIndex = currentIndex > 0 ? currentIndex - 1 : 1;
      nextActiveId = fileIds[nextIndex];
    }

    /**
     * 레이아웃 정리 로직
     * 삭제 전 파일이 1개였다면, 이 파일을 닫을 때 레이아웃도 함께 정리해야 함
     */
    if (fileIds.length === 1) {
      if (totalSplits > 1) {
        // 다른 Split이 존재하면 현재 Split 자체를 삭제
        deleteLinearTab(tabKey);
        return;
      } else {
        // 마지막 남은 Split의 마지막 탭이라면 에디터 비우기
        removeLinear(tabKey, fileId);
        setActiveFileId(null);
        return;
      }
    }

    // 파일이 여러 개라면 현재 탭만 제거
    removeLinear(tabKey, fileId);

    if (nextActiveId) {
      setActiveTab(tabKey, nextActiveId);
    }
  }, [
    activeTab,
    removeLinear,
    takeTab,
    tabKeys,
    deleteLinearTab,
    setActiveFileId,
  ]);

  useGlobalShortcuts({
    onNextTab: () => handleTabSwitch('next'),
    onPrevTab: () => handleTabSwitch('prev'),
    onNextSidebarTab: () => handleSidebarSwitch('next'),
    onPrevSidebarTab: () => handleSidebarSwitch('prev'),
    onCloseTab: handleCloseActiveTab,
    onToggleSidebar: () => {
      toggleSidebarTab(activeSidebarTab || 'FILES');
    },
    onToggleOutput: toggleConsole,
  });

  return null; // UI는 렌더링하지 않음
}
