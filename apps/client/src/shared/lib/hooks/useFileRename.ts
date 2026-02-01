import { useFileStore } from '@/stores/file';
import { EXT_TYPES } from '@codejam/common';
import { useContext, useState } from 'react';
import { toast } from '@codejam/ui';
import { extname } from '../file';
import { LinearTabApiContext } from '@/contexts/ProviderAPI';
import { ActiveTabContext } from '@/contexts/TabProvider';

export function useFileRename(roomCode: string | null) {
  const [isDuplicated, setIsDuplicated] = useState(false);

  const activeFileId = useFileStore((state) => state.activeFileId);

  const getFileId = useFileStore((state) => state.getFileId);
  const getFileName = useFileStore((state) => state.getFileName);
  const createFile = useFileStore((state) => state.createFile);
  const setActiveFile = useFileStore((state) => state.setActiveFile);
  const measureCapacity = useFileStore((state) => state.measureCapacity);
  const addTempFile = useFileStore((state) => state.addTempFile);
  const clearTempFile = useFileStore((state) => state.clearTempFile);
  const getTempFiles = useFileStore((state) => state.getTempFiles);
  const { appendLinear } = useContext(LinearTabApiContext);
  const { activeTab } = useContext(ActiveTabContext);

  if (!roomCode) {
    throw new Error('Invalid roomCode');
  }

  /**
   * Checks extension and duplicate names
   */
  const handleCheckRename = (filename: string): boolean => {
    // Check extension
    const ext = extname(filename);

    if (!ext || !EXT_TYPES.includes(ext)) {
      toast.error('유효하지 않은 확장자입니다.');
      return false;
    }

    // Check duplicate
    if (getFileId(filename)) {
      setIsDuplicated(true);
      toast.error('중복되는 파일명입니다.');
      return false;
    }

    setIsDuplicated(false);
    return true;
  };

  const checkInvalidFiles = (files: File[]) => {
    const currentMimes = ['text/javascript', 'text/html', 'text/css'];
    return files.some(
      (file) => !currentMimes.includes(file.type) && !extname(file.name),
    );
  };

  const checkFileBytes = (files: File[]) =>
    files
      .map((file) => file.size)
      .reduce((previous, current) => previous + current);

  const handleFileChange = async (files: FileList | null) => {
    const CURRENT_SIZE = 1024 * 1024 - measureCapacity();
    clearTempFile();

    if (!roomCode) {
      toast.error('유효하지 않은 방 코드입니다.');
      return;
    }

    if (!files || files.length === 0) {
      toast.error('파일을 하나 이상 선택해주세요.');
      return;
    }

    const fileArray = Array.from(files);

    if (checkInvalidFiles(fileArray)) {
      toast.error('정해진 파일 타입만 업로드할 수 있습니다.');
      return;
    }

    if (checkFileBytes(fileArray) > CURRENT_SIZE) {
      toast.error('파일의 크기가 1MB 를 초과했습니다.');
      return;
    }

    for (const file of fileArray) {
      if (getFileId(file.name)) {
        addTempFile(file);
      } else {
        const result = handleCheckRename(file.name);
        if (result) {
          const content = await file.text();
          const fileId = createFile(file.name, content);
          appendLinear(activeTab.active, fileId, {
            fileName: getFileName(fileId),
          });
          if (!activeFileId) {
            setActiveFile(fileId);
          }
        }
      }
    }

    if (getTempFiles().length > 0) {
      setIsDuplicated(true);
    }
  };

  return {
    isDuplicated,
    setIsDuplicated,
    handleCheckRename,
    handleFileChange,
  };
}
