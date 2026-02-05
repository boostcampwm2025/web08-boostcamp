import { LinearTabApiContext } from '@/contexts/ProviderAPI';
import { ActiveTabContext } from '@/contexts/TabProvider';
import { useFileStore } from '@/stores/file';
import { useContext, useEffect } from 'react';

export default function FileObserver() {
  const { appendLinear } = useContext(LinearTabApiContext);
  const { activeTab } = useContext(ActiveTabContext);
  const activeFileId = useFileStore((state) => state.activeFileId);
  const getFileName = useFileStore((state) => state.getFileName);

  useEffect(() => {
    const fileName = getFileName(activeFileId);
    if (activeFileId && fileName && activeTab.active) {
      appendLinear(activeTab.active, activeFileId, {
        fileName: getFileName(activeFileId),
      });
    }
  }, [activeFileId]);

  return <></>;
}
