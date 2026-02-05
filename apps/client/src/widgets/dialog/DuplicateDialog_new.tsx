import {
  RadixDialog as Dialog,
  RadixDialogClose as DialogClose,
  RadixDialogContent as DialogContent,
  RadixDialogDescription as DialogDescription,
  RadixDialogFooter as DialogFooter,
  RadixDialogHeader as DialogHeader,
  RadixDialogTitle as DialogTitle,
} from '@codejam/ui';
import { Button } from '@codejam/ui';
import { useFileStore } from '@/stores/file';
import { extname, purename } from '@/shared/lib/file';
import { uploadFile } from '@/shared/lib/file';

interface DuplicateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filename: string;
  onClick: () => void;
  file?: File;
}

export function DuplicateDialog({
  open,
  onOpenChange,
  filename,
  onClick,
  file,
}: DuplicateDialogProps) {
  const overwriteFile = useFileStore((state) => state.overwriteFile);
  const createFile = useFileStore((state) => state.createFile);
  const getFileId = useFileStore((state) => state.getFileId);
  const getFileNamesMap = useFileStore((state) => state.getFileNamesMap);

  const handleOverwrite = async () => {
    const fileId = getFileId(filename);
    if (!fileId || !file) return;

    try {
      const { content, type } = await uploadFile(file);
      overwriteFile(fileId, content, type);
      onOpenChange(false);
      onClick();
    } catch (error) {
      console.error('Failed to overwrite file:', error);
    }
  };

  const handleRename = async () => {
    const fileId = getFileId(filename);
    if (!fileId) return;

    const newName = (): string => {
      const fileNamesMap = getFileNamesMap();
      if (!fileNamesMap) {
        return filename;
      }

      const entries: [string, string][] = Object.entries(
        fileNamesMap.toJSON(),
      ).filter(([name]) => {
        const pure = purename(filename);
        const size = pure.length;
        if (name.length < size) {
          return false;
        }
        return name.substring(0, size).trim() === pure.trim();
      });

      const top = entries.sort((a, b) => b[1].localeCompare(a[1]))[0];
      const ext = extname(top[0]);
      const pure = purename(top[0]);
      const fileMatch = pure.match(/.+\((\d+)\)$/i);

      if (!fileMatch) {
        return `${pure} (1).${ext}`;
      }

      return `${pure.replace(/\((\d+)\)$/i, `(${(parseInt(fileMatch[1]) + 1).toString()})`)}.${ext}`;
    };

    if (!file) return;

    try {
      const { content, type } = await uploadFile(file);
      const name = newName();
      createFile(name, content, type);
      onOpenChange(false);
      onClick();
    } catch (error) {
      console.error('Failed to create file with new name:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>파일 중복</DialogTitle>
          <DialogDescription>
            <strong className="text-foreground">{filename}</strong> 파일이 이미
            존재합니다.
            <br />
            어떻게 하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="secondary" onClick={handleOverwrite}>
            덮어쓰기
          </Button>
          <Button type="button" onClick={handleRename}>
            자동 이름 변경
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              취소
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
