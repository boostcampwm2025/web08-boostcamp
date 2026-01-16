import { useFileStore } from '@/stores/file';
import { File } from './File';
import { useRoomStore } from '@/stores/room';
import { usePt } from '@/stores/pts';
import { useEffect, useState } from 'react';
import { FileHeader } from './components/FileHeader';

export function FileList() {
  const getFileIdMap = useFileStore((state) => state.getFileIdMap);
  const yDoc = useFileStore((state) => state.yDoc);

  const [count, setCount] = useState(0);
  const [entries, setEntries] = useState<[string, string][]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const myPtId = useRoomStore((state) => state.myPtId);
  const me = usePt(myPtId);
  const hasPermission = me?.role === 'host' || me?.role === 'editor';

  useEffect(() => {
    const fileMap = getFileIdMap();
    if (!fileMap) {
      setCount(0);
      setEntries([]);
      return;
    }

    // 초기값 설정
    const updateFileList = () => {
      const newEntries: [string, string][] = Object.entries(fileMap.toJSON());
      setCount(newEntries.length);
      setEntries(newEntries);
    };

    updateFileList();

    // YMap 변경 감지
    const observer = () => {
      updateFileList();
    };

    fileMap.observe(observer);

    return () => {
      fileMap.unobserve(observer);
    };
  }, [yDoc, getFileIdMap]);

  return (
    <div className="w-full px-4">
      <FileHeader
        count={count}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <div
        className={`flex flex-col overflow-hidden transition-all duration-200 ease-in-out ${
          isCollapsed ? 'max-h-0' : 'max-h-[600px]'
        }`}
      >
        {entries.map(([fileName, fileId]) => (
          <File
            key={fileId}
            fileId={fileId}
            fileName={fileName}
            hasPermission={hasPermission}
          />
        ))}
      </div>
    </div>
  );
}

export { File } from './File';
