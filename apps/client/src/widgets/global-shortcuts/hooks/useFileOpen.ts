import { useContext, useState } from 'react';
import { LinearTabApiContext } from '@/contexts/ProviderAPI';
import { ActiveTabContext } from '@/contexts/TabProvider';
import { useFileStore } from '@/stores/file';

export function useFileOpen() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { appendLinear } = useContext(LinearTabApiContext);
  const { activeTab } = useContext(ActiveTabContext);
  const getFileName = useFileStore((state) => state.getFileName);
  const setActiveFile = useFileStore((state) => state.setActiveFile);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleSelectFile = (fileId: string) => {
    setActiveFile(fileId);
    appendLinear(activeTab.active, fileId, {
      fileName: getFileName(fileId),
    });
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    handleOpenDialog,
    handleSelectFile,
  };
}
