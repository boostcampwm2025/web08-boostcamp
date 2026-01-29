import { ROLE } from '@codejam/common';
import { useFileStore } from '@/stores/file';
import { File } from './components/File';
import { useRoomStore } from '@/stores/room';
import { usePt } from '@/stores/pts';
import { useEffect, useState } from 'react';
import { SidebarHeader } from '@codejam/ui';
import { CapacityGauge } from '../capacity-gauge';

type FileListProps = {
  readOnly: boolean;
};

export function FileList({ readOnly }: FileListProps) {
  const getFileIdMap = useFileStore((state) => state.getFileIdMap);
  const yDoc = useFileStore((state) => state.yDoc);

  const [count, setCount] = useState(0);
  const [entries, setEntries] = useState<[string, string][]>([]);

  const myPtId = useRoomStore((state) => state.myPtId);
  const me = usePt(myPtId);
  const hasPermission = me?.role === ROLE.HOST || me?.role === ROLE.EDITOR;

  useEffect(() => {
    const fileMap = getFileIdMap();
    if (!fileMap) {
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
    <div className="flex h-full w-full flex-col px-4">
      <SidebarHeader title="파일" count={count} action={<CapacityGauge />} />

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {entries.map(([fileName, fileId]) => (
          <File
            key={fileId}
            fileId={fileId}
            fileName={fileName}
            hasPermission={hasPermission}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}

export { File } from './components/File';
