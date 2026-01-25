import { socket } from '@/shared/api/socket';
import { useFileStore } from '@/stores/file';
import { SOCKET_EVENTS } from '@codejam/common';
import { useState } from 'react';
import { toast } from 'sonner';
import { extname } from '../file';

export type FileResult =
  | {
      error: false;
    }
  | {
      error: true;
      type: 'ext' | 'duplicate';
      message?: string;
    };

export function useFileRename(roomCode: string | null) {
  const [isDuplicated, setIsDuplicated] = useState(false);
  const {
    getFileId,
    createFile,
    setActiveFile,
    activeFileId,
    measureCapacity,
    addTempFile,
    clearTempFile,
    getTempFiles,
  } = useFileStore();

  if (!roomCode) {
    throw new Error('Invalid roomCode');
  }

  const handleShowModal = (result: FileResult): boolean => {
    if (!result.error) {
      setIsDuplicated(false);
      return true;
    }

    if (result.type === 'duplicate') {
      setIsDuplicated(true);
    }

    if (result.message) {
      toast.error(result.message);
    }

    return false;
  };

  const handleCheckRename = (filename: string): Promise<boolean> => {
    return new Promise((resolve) => {
      socket.emit(
        SOCKET_EVENTS.CHECK_FILENAME,
        {
          roomCode,
          filename,
        },
        (response: FileResult) => {
          resolve(handleShowModal(response));
        },
      );
    });
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
      console.log(files);
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
        const result = await handleCheckRename(file.name);
        if (result) {
          const content = await file.text();
          const fileId = createFile(file.name, content);
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
