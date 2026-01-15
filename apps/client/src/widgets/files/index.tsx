import { useFileStore } from '@/stores/file';
import { File } from './File';
import { useRoomStore } from '@/stores/room';
import { usePt } from '@/stores/pts';

export function FileList() {
  const getFileIdMap = useFileStore((state) => state.getFileIdMap);
  const fileMap = getFileIdMap();
  const count = fileMap?.size ?? 0;
  const entries: [string, string][] = Object.entries(fileMap?.toJSON() ?? {});

  const myPtId = useRoomStore((state) => state.myPtId);
  const me = usePt(myPtId);
  const hasPermission = me?.role === 'host' || me?.role === 'editor';

  return (
    <div className="w-full min-w-3xs bg-white dark:bg-gray-800 p-4 font-sans">
      <h2 className="text-sm font-bold uppercase text-gray-700 dark:text-gray-200 border-b border-t pt-2 pb-2 mb-2">
        FILES ({count})
      </h2>

      <div className="space-y-1 mt-4">
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
