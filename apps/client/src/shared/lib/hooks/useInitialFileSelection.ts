import { useEffect } from 'react';
import { useFileStore } from '@/stores/file';

export function useInitialFileSelection() {
  const isInitialDocLoaded = useFileStore((state) => state.isInitialDocLoaded);
  const initializeActiveFile = useFileStore(
    (state) => state.initializeActiveFile,
  );

  useEffect(() => {
    if (isInitialDocLoaded) {
      initializeActiveFile();
    }
  }, [isInitialDocLoaded, initializeActiveFile]);
}
