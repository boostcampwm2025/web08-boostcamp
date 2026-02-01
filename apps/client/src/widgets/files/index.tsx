import { ROLE } from '@codejam/common';
import { useFileStore } from '@/stores/file';
import { File } from './components/File';
import { useRoomStore } from '@/stores/room';
import { usePt } from '@/stores/pts';
import { useMemo, useState } from 'react';
import { SidebarHeader } from '@codejam/ui';
import { CapacityGauge } from '../capacity-gauge';
import { FileHeaderActions } from './components/FileHeaderActions';
import type { FileSortKey } from './lib/types';
import { filterFiles, sortFiles } from './lib/file-logic';
import { FileFilterBar } from './components/FileFilterBar';

export function FileList() {
  const files = useFileStore((state) => state.files);
  const roomCode = useRoomStore((state) => state.roomCode);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<FileSortKey>('name-asc');

  const myPtId = useRoomStore((state) => state.myPtId);
  const me = usePt(myPtId);
  const hasPermission = me?.role === ROLE.HOST || me?.role === ROLE.EDITOR;

  const processedFiles = useMemo(() => {
    const filtered = filterFiles(files, searchQuery);
    return sortFiles(filtered, sortKey);
  }, [files, searchQuery, sortKey]);

  return (
    <div className="flex h-full w-full flex-col">
      {/* 헤더 */}
      <div className="px-4">
        <SidebarHeader
          title="파일"
          count={processedFiles.length}
          action={
            roomCode &&
            hasPermission && <FileHeaderActions roomCode={roomCode} />
          }
        />
      </div>

      {/* 필터 & 검색 */}
      <div className="border-border/40 border-b px-4 pb-3">
        <FileFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortKey={sortKey}
          onSortChange={setSortKey}
        />
      </div>

      {/* 파일 리스트 */}
      <div className="scrollbar-hide flex-1 overflow-y-auto px-4 py-2">
        {processedFiles.length > 0 ? (
          <div className="flex flex-col gap-0.5">
            {processedFiles.map((file) => (
              <File
                key={file.id}
                fileId={file.id}
                fileName={file.name}
                hasPermission={hasPermission}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-40 flex-col items-center justify-center text-center">
            <p className="text-muted-foreground text-sm">
              {searchQuery ? '검색 결과가 없습니다.' : '파일이 없습니다.'}
            </p>
          </div>
        )}
      </div>

      {/* 용량 게이지 */}
      <div className="border-border/40 bg-muted/5 mt-auto border-t px-4 py-3">
        <CapacityGauge />
      </div>
    </div>
  );
}
