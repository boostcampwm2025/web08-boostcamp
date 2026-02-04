import { useContext } from 'react';
import { ActiveTabContext } from '@/contexts/TabProvider';
import { LinearTabApiContext } from '@/contexts/ProviderAPI';
import { useGlobalShortcuts } from '@/shared/lib/hooks/useGlobalShortcuts';

export function GlobalShortcutHandler() {
  const { activeTab, setActiveTab } = useContext(ActiveTabContext);
  const { takeTab } = useContext(LinearTabApiContext);

  const handleTabSwitch = (direction: 'next' | 'prev') => {
    const currentLinearKey = activeTab.active; // 현재 포커스된 레이아웃 키
    const fileTabMap = takeTab(currentLinearKey); // 해당 레이아웃의 파일들

    if (!fileTabMap) return;

    const fileIds = Object.keys(fileTabMap);
    const currentFileId = activeTab[currentLinearKey];
    const currentIndex = fileIds.indexOf(currentFileId);

    if (currentIndex === -1) return;

    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % fileIds.length;
    } else {
      nextIndex = (currentIndex - 1 + fileIds.length) % fileIds.length;
    }

    // 다음 탭으로 전환
    setActiveTab(currentLinearKey, fileIds[nextIndex]);
  };

  useGlobalShortcuts({
    onNextTab: () => handleTabSwitch('next'),
    onPrevTab: () => handleTabSwitch('prev'),
  });

  return null; // UI는 렌더링하지 않음
}
