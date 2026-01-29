import { extname, purename } from '@/shared/lib/file';
import {
  RadixContextMenu as ContextMenu,
  RadixContextMenuContent as ContextMenuContent,
  RadixContextMenuItem as ContextMenuItem,
  RadixContextMenuTrigger as ContextMenuTrigger,
} from '@codejam/ui';
import { useFileStore } from '@/stores/file';
import { Edit2, Trash2 } from 'lucide-react';
import { memo, useState } from 'react';
import { RenameDialog } from '@/widgets/dialog/RenameDialog';
import { RadixDialog as Dialog } from '@codejam/ui';
import { DeleteDialog } from '@/widgets/dialog/DeleteDialog';

type DialogType = 'RENAME' | 'DELETE' | undefined;
type FileProps = {
  fileId: string;
  fileName: string;
  hasPermission: boolean;
};

const ACTIVE_FILE_BG = 'bg-blue-100 dark:bg-blue-900';
const INACTIVE_FILE_HOVER = 'hover:bg-gray-100 dark:hover:bg-gray-700';

export const File = memo(({ fileId, fileName, hasPermission }: FileProps) => {
  const setActiveFile = useFileStore((state) => state.setActiveFile);
  const activeFileId = useFileStore((state) => state.activeFileId);

  const [open, setOpen] = useState(false);
  const [dialogType, setDialogType] = useState<DialogType>(undefined);

  const isActive = activeFileId === fileId;

  const filePureName = purename(fileName);
  const fileExt = extname(fileName);

  const handleClick = () => {
    setActiveFile(fileId);
  };

  const handleContextClick = (type: DialogType) => {
    setDialogType(type);
    setOpen(true);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger disabled={!hasPermission}>
          <div
            className={`flex items-center justify-between p-2 transition-all duration-200 select-none ${isActive ? ACTIVE_FILE_BG : INACTIVE_FILE_HOVER}`}
            onClick={handleClick}
          >
            <div className="flex items-center space-x-3">
              <div>
                <div className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-100">
                  <p className="w-50 truncate" title={fileName}>
                    {fileName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-white dark:bg-black dark:text-white">
          <ContextMenuItem onClick={() => handleContextClick('RENAME')}>
            <Edit2 className="dark:text-white" />
            이름 변경
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleContextClick('DELETE')}>
            <Trash2 color="red" />
            삭제
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        {dialogType === 'RENAME' ? (
          <RenameDialog
            fileExt={fileExt}
            fileId={fileId}
            filePurename={filePureName}
            onOpen={setOpen}
          />
        ) : (
          <DeleteDialog fileId={fileId} fileName={fileName} onOpen={setOpen} />
        )}
      </Dialog>
    </>
  );
});

File.displayName = 'FileList';
