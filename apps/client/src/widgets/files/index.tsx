import { useFileStore } from '@/stores/file';
import { File } from './File';
import { useState } from 'react';
import { FileHeader } from './components/FileHeader';

export function FileList() {
  const getFileIdMap = useFileStore((state) => state.getFileIdMap);
  const fileMap = getFileIdMap();
  const count = fileMap?.size ?? 0;
  const entries: [string, string][] = Object.entries(fileMap?.toJSON() ?? {});

  // 접기/펼치기 상태 관리
  const [isCollapsed, setIsCollapsed] = useState(false);

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
          <File key={fileId} fileId={fileId} fileName={fileName} />
        ))}
      </div>
    </div>
  );
}

export { File } from './File';
