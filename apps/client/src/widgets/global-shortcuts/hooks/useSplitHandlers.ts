import { useCallback, useContext } from 'react';
import { ActiveTabContext } from '@/contexts/TabProvider';
import { LinearTabApiContext } from '@/contexts/ProviderAPI';
import { useFileStore } from '@/stores/file';

export function useSplitHandlers() {
  const { activeTab } = useContext(ActiveTabContext);
  const { createLinearTab, deleteLinearTab, tabKeys, takeTab } =
    useContext(LinearTabApiContext);
  const getFileName = useFileStore((state) => state.getFileName);

  const handleToggleSplit = useCallback(() => {
    const keys = tabKeys();
    const currentActiveSplit = activeTab.active;

    if (keys.length < 2) {
      const currentFilesMap = takeTab(currentActiveSplit);
      const currentFileId = activeTab[currentActiveSplit];

      if (
        !currentFilesMap ||
        !currentFileId ||
        !currentFilesMap[currentFileId]
      ) {
        // 파일이 없거나(EmptyView), 잔상만 남은 경우 분할하지 않음
        return;
      }

      const newSplitKey = Date.now();
      // 현재 열린 파일을 새 스플릿에도 열어주기.
      createLinearTab(newSplitKey, currentFileId, {
        fileName: getFileName(currentFileId),
      });
    } else {
      // 스플릿이 두 개면 현재 활성화된 스플릿을 제거
      deleteLinearTab(currentActiveSplit);
    }
  }, [
    tabKeys,
    activeTab,
    createLinearTab,
    deleteLinearTab,
    getFileName,
    takeTab,
  ]);

  return { handleToggleSplit };
}
