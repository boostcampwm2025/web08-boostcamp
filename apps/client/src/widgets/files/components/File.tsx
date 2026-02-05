import { cn, toast } from '@codejam/ui';
import { useFileStore } from '@/stores/file';
import { memo, useState, type DragEvent, type MouseEvent } from 'react';
import { DeleteDialog } from '@/widgets/dialog/DeleteDialog';
import { FileMoreMenu } from './FileMoreMenu';
import { InlineFileInput } from './InlineFileInput';

type DialogType = 'RENAME' | 'DELETE' | undefined;
type FileProps = {
  fileId: string;
  fileName: string;
  hasPermission: boolean;
};

const ACTIVE_FILE_BG = 'bg-accent/80 text-primary rounded-sm';
const INACTIVE_FILE_HOVER =
  'hover:bg-muted/60 text-muted-foreground hover:text-foreground rounded-lg';

export const File = memo(({ fileId, fileName, hasPermission }: FileProps) => {
  const setActiveFile = useFileStore((state) => state.setActiveFile);
  const activeFileId = useFileStore((state) => state.activeFileId);
  const renameFile = useFileStore((state) => state.renameFile);

  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const [open, setOpen] = useState(false);
  const [dialogType, setDialogType] = useState<DialogType>(undefined);
  const [isRenaming, setIsRenaming] = useState(false);

  const isActive = activeFileId === fileId;

  const handleClick = () => {
    setActiveFile(fileId);
  };

  const handleActionClick = (type: DialogType) => {
    if (type === 'RENAME') {
      setIsRenaming(true);
      return;
    }
    setDialogType(type);
    setOpen(true);
  };

  const handleRenameSubmit = async (newFileName: string) => {
    if (fileName === newFileName) {
      setIsRenaming(false);
      return;
    }

    try {
      await renameFile(fileId, newFileName);
      setIsRenaming(false);
    } catch {
      toast.error('파일 이름 변경에 실패했습니다.');
    }
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

  if (isRenaming) {
    return (
      <InlineFileInput
        initialValue={fileName}
        onSubmit={handleRenameSubmit}
        onCancel={() => setIsRenaming(false)}
      />
    );
  }

  return (
    <>
      <div
        draggable
        className={cn(
          'group relative flex h-10 cursor-pointer items-center justify-between px-2 transition-all duration-200 select-none',
          isActive ? ACTIVE_FILE_BG : INACTIVE_FILE_HOVER,
        )}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onDragStart={handleDragStart}
      >
        <div className="flex w-full items-center space-x-3 overflow-hidden">
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

      <DeleteDialog
        fileId={fileId}
        fileName={fileName}
        open={open && dialogType === 'DELETE'}
        onOpenChange={setOpen}
      />
    </>
  );
});

File.displayName = 'FileList';
