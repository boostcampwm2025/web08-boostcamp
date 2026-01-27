import {
  RadixDialog as Dialog,
  RadixDialogContent as DialogContent,
  RadixDialogDescription as DialogDescription,
  RadixDialogFooter as DialogFooter,
  RadixDialogHeader as DialogHeader,
  RadixDialogTitle as DialogTitle,
} from '@codejam/ui';
import { RadixButton as Button } from '@codejam/ui';
import { useFileStore } from '@/stores/file';
import { extname, purename } from '@/shared/lib/file';

interface DuplicateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DuplicateDialog({ open, onOpenChange }: DuplicateDialogProps) {
  const {
    overwriteFile,
    createFile,
    getFileId,
    getFileIdMap,
    tempFiles,
    shiftTempFile,
  } = useFileStore();
  const fileName = tempFiles && tempFiles[0] ? tempFiles[0].name : '';

  const checkRepeat = () => {
    shiftTempFile();
    if (tempFiles.length === 0) {
      onOpenChange(false);
    }
  };

  const handleOverwrite = async () => {
    const fileId = getFileId(tempFiles[0].name);
    if (!fileId) {
      return;
    }

    const content = await tempFiles[0].text();
    overwriteFile(fileId, content);
    checkRepeat();
  };

  const handleRename = async () => {
    const fileId = getFileId(fileName);

    if (!fileId) {
      return;
    }

    const newName = (): string => {
      const fileIdMap = getFileIdMap();
      if (!fileIdMap) {
        return fileName;
      }

      const entries: [string, string][] = Object.entries(
        fileIdMap.toJSON(),
      ).filter(([name]) => {
        const pure = purename(fileName);
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
    const content = (await tempFiles[0].text()) ?? '';
    createFile(newName(), content);
    checkRepeat();
  };

  const handleCancel = () => {
    checkRepeat();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>파일 중복</DialogTitle>
          <DialogDescription>
            <b>{fileName}</b>파일은 이미 존재합니다. 하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={handleOverwrite}>
            덮어쓰기
          </Button>
          <Button type="button" onClick={handleRename}>
            이름변경
          </Button>
          <Button type="button" onClick={handleCancel}>
            취소
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
