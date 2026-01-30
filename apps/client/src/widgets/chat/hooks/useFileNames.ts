import { useState, useEffect } from 'react';
import { useFileStore } from '@/stores/file';

/**
 * 현재 방의 파일명 목록을 반환하는 훅
 * - YMap observe로 실시간 업데이트
 * - 채팅 파일 언급(@) 자동완성에 사용
 */
export function useFileNames(): string[] {
  const getFileIdMap = useFileStore((state) => state.getFileIdMap);
  const [fileNames, setFileNames] = useState<string[]>([]);

  useEffect(() => {
    const fileMap = getFileIdMap();
    if (!fileMap) return;

    const update = () => {
      setFileNames(Object.keys(fileMap.toJSON()));
    };

    update();
    fileMap.observe(update);

    return () => {
      fileMap.unobserve(update);
    };
  }, [getFileIdMap]);

  return fileNames;
}
