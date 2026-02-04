import { useCallback, useContext } from 'react';
import { ActiveTabContext } from '@/contexts/TabProvider';
import { LinearTabApiContext } from '@/contexts/ProviderAPI';

export function useTabNavigation() {
  const { activeTab, setActiveTab } = useContext(ActiveTabContext);
  const { takeTab } = useContext(LinearTabApiContext);

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

  return { handleTabSwitch };
}
