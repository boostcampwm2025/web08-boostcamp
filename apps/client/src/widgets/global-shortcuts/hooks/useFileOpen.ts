import { useState } from 'react';
import { useFileStore } from '@/stores/file';

export function useFileOpen() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const setActiveFile = useFileStore((state) => state.setActiveFile);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleSelectFile = (fileId: string) => {
    setActiveFile(fileId);
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    handleOpenDialog,
    handleSelectFile,
  };
}
