import { useEffect } from 'react';
import { useFileStore } from '@/stores/file';

export function useInitialFileSelection() {
  const isInitialDocLoaded = useFileStore((state) => state.isInitialDocLoaded);
  const initializeDefaultFile = useFileStore(
    (state) => state.initializeDefaultFile,
  );
  const initializeActiveFile = useFileStore(
    (state) => state.initializeActiveFile,
  );

  useEffect(() => {
    if (isInitialDocLoaded) {
      // Initialize with default file if needed
      initializeDefaultFile();

      // Initialize active file
      initializeActiveFile();
    }
  }, [isInitialDocLoaded, initializeDefaultFile, initializeActiveFile]);
}
