import { RadixDialog as Dialog, cn } from '@codejam/ui';
import { useFileStore } from '@/stores/file';
import {
  memo,
  useContext,
  useState,
  type DragEvent,
  type MouseEvent,
} from 'react';
import { useTabStore } from '@/stores/tab';
import { LinearTabApiContext } from '@/contexts/ProviderAPI';
import { RenameDialog } from '@/widgets/dialog/RenameDialog';
import { DeleteDialog } from '@/widgets/dialog/DeleteDialog';
import { FileMoreMenu } from './FileMoreMenu';

type DialogType = 'RENAME' | 'DELETE' | undefined;
type FileProps = {
  fileId: string;
  fileName: string;
  hasPermission: boolean;
  readOnly: boolean;
};

const ACTIVE_FILE_BG = 'bg-primary/10 text-primary font-semibold rounded-lg';
const INACTIVE_FILE_HOVER =
  'hover:bg-muted/60 text-muted-foreground hover:text-foreground rounded-lg';

export const File = memo(
  ({ fileId, fileName, hasPermission, readOnly }: FileProps) => {
    const setActiveFile = useFileStore((state) => state.setActiveFile);
    const activeFileId = useFileStore((state) => state.activeFileId);
    const activeTabKey = useTabStore((state) => state.activeTabKey);
    const { appendLinear } = useContext(LinearTabApiContext);
    const setActiveTab = useTabStore((state) => state.setActiveTab);

    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    const [open, setOpen] = useState(false);
    const [dialogType, setDialogType] = useState<DialogType>(undefined);

    const isActive = activeFileId === fileId;

    const handleClick = () => {
      setActiveFile(fileId);
      appendLinear(activeTabKey, fileName, {
        fileId,
        readOnly,
      });
      setActiveTab(activeTabKey, fileName);
    };

    const handleActionClick = (type: DialogType) => {
      setDialogType(type);
      setOpen(true);
    };

    const handleDragStart = (ev: DragEvent) => {
      ev.dataTransfer.setData(
        'application/json',
        JSON.stringify({ fileName, fileId }),
      );
    };

    const onMouseDown = (ev: MouseEvent) => {
      setX(ev.clientX);
      setY(ev.clientY);
    };

    const onMouseUp = (ev: MouseEvent) => {
      const dx = Math.abs(ev.clientX - x);
      const dy = Math.abs(ev.clientY - y);

      if (dx < 5 && dy < 5) {
        handleClick();
      }
    };

    return (
      <>
        <div
          draggable
          className={cn(
            'group relative my-0.5 flex cursor-pointer items-center justify-between p-2 px-3 transition-all duration-200 select-none',
            isActive ? ACTIVE_FILE_BG : INACTIVE_FILE_HOVER,
          )}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onDragStart={handleDragStart}
        >
          <div className="flex items-center space-x-3 overflow-hidden">
            <p className="truncate text-sm" title={fileName}>
              {fileName}
            </p>
          </div>

          {/* 더보기 액션 버튼 */}
          {hasPermission && (
            <FileMoreMenu
              fileId={fileId}
              fileName={fileName}
              isActive={isActive}
              onActionClick={handleActionClick}
            />
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          {dialogType === 'RENAME' ? (
            <RenameDialog
              fileId={fileId}
              fileName={fileName}
              onOpen={setOpen}
            />
          ) : (
            <DeleteDialog
              fileId={fileId}
              fileName={fileName}
              onOpen={setOpen}
            />
          )}
        </Dialog>
      </>
    );
  },
);

File.displayName = 'FileList';
