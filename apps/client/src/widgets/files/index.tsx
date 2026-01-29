import { ROLE } from '@codejam/common';
import { useFileStore } from '@/stores/file';
import { File } from './components/File';
import { useRoomStore } from '@/stores/room';
import { usePt } from '@/stores/pts';
import { useEffect, useMemo, useState } from 'react';
import { SidebarHeader } from '@codejam/ui';
import { CapacityGauge } from '../capacity-gauge';
import { FileHeaderActions } from './components/FileHeaderActions';
import type { FileSortKey } from './lib/types';
import { filterFiles, sortFiles } from './lib/file-logic';
import { FileFilterBar } from './components/FileFilterBar';

type FileListProps = {
  readOnly: boolean;
};

export function FileList({ readOnly }: FileListProps) {
  const getFileIdMap = useFileStore((state) => state.getFileIdMap);
  const roomCode = useRoomStore((state) => state.roomCode);

  const [entries, setEntries] = useState<[string, string][]>([]);

  // 필터 및 정렬 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<FileSortKey>('name-asc');

  const myPtId = useRoomStore((state) => state.myPtId);
  const me = usePt(myPtId);
  const hasPermission = me?.role === ROLE.HOST || me?.role === ROLE.EDITOR;

  useEffect(() => {
    const fileMap = getFileIdMap();
    if (!fileMap) return;
    const update = () => setEntries(Object.entries(fileMap.toJSON()));
    update();
    fileMap.observe(update);
    return () => fileMap.unobserve(update);
  }, [getFileIdMap]);

  const processedFiles = useMemo(() => {
    const filtered = filterFiles(entries, searchQuery);
    return sortFiles(filtered, sortKey);
  }, [entries, searchQuery, sortKey]);

  return (
    <div className="flex h-full w-full flex-col px-4">
      <SidebarHeader
        title="파일"
        count={processedFiles.length}
        action={
          <div className="flex items-center gap-3">
            <CapacityGauge />
            {roomCode && hasPermission && (
              <FileHeaderActions roomCode={roomCode} />
            )}
          </div>
        }
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* 필터 및 정렬 바 */}
        <FileFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortKey={sortKey}
          onSortChange={setSortKey}
        />

        {/* 파일 리스트 영역 */}
        <div className="flex-1 overflow-y-auto pt-1">
          {processedFiles.length > 0 ? (
            processedFiles.map(([fileName, fileId]) => (
              <File
                key={fileId}
                fileId={fileId}
                fileName={fileName}
                hasPermission={hasPermission}
                readOnly={readOnly}
              />
            ))
          ) : (
            <div className="text-muted-foreground py-10 text-center text-sm">
              {searchQuery ? '검색 결과가 없습니다.' : '파일이 없습니다.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { File } from './components/File';
