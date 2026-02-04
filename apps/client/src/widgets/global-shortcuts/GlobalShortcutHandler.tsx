import {
  useGlobalShortcuts,
  useSplitHandlers,
  useSplitFocus,
  useSidebarNavigation,
  useTabNavigation,
  useTabClose,
} from './hooks';
import { useSidebarStore } from '@/stores/sidebar';
import { useConsoleStore } from '@/stores/console';

export function GlobalShortcutHandler() {
  const { activeSidebarTab, toggleSidebarTab } = useSidebarStore();
  const { toggleConsole } = useConsoleStore();

  const { handleToggleSplit } = useSplitHandlers();
  const { handleFocusSplit } = useSplitFocus();
  const { handleSidebarSwitch } = useSidebarNavigation();
  const { handleTabSwitch } = useTabNavigation();
  const { handleCloseActiveTab } = useTabClose();

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
    onToggleSplit: handleToggleSplit,
    onFocusSplit: handleFocusSplit,
  });

  return null; // UI는 렌더링하지 않음
}
