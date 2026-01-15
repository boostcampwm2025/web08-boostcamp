import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { DialogClose } from "@radix-ui/react-dialog";
import { useFileStore } from "@/stores/file";
import { extname, purename } from "@/shared/lib/file";

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
  file
}: DuplicateDialogProps) {

  const { overwriteFile, createFile, getFileId, getFileIdMap } = useFileStore();

  const handleOverwrite = async () => {
    const fileId = getFileId(filename);
    if (!fileId) {
      return;
    }

    const content = await file?.text();
    overwriteFile(fileId, content);
    onOpenChange(false);
    onClick();
  };

  const handleRename = async () => {
    const fileId = getFileId(filename);
    if (!fileId) {
      return;
    }

    const newName = (): string => {
      const fileIdMap = getFileIdMap();
      if (!fileIdMap) {
        return filename;
      }

      const entries: [string, string][] = Object.entries(fileIdMap.toJSON()).filter(([name, ]) => {
        const pure = purename(filename);
        const size = pure.length
        if (name.length < size) {
          return false;
        }
        return name.substring(0, size).trim() === pure.trim()
      });

      const top = entries.sort((a, b) => b[1].localeCompare(a[1]))[0];
      const ext = extname(top[0]);
      const pure = purename(top[0]);
      const fileMatch = pure.match(/.+\((\d+)\)$/i);
      
      if (!fileMatch) {
        return `${pure} (1).${ext}`;
      }

      return `${pure.replace(/\((\d+)\)$/i, `(${(parseInt(fileMatch[1]) + 1).toString()})`)}.${ext}`;
    }
    const content = await (file?.text()) ?? "";
    createFile(newName(), content);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>파일 중복</DialogTitle>
          <DialogDescription>
            이미 존재하는 파일입니다. 어떻게 하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={handleOverwrite}>
            덮어쓰기
          </Button>
          <Button type="button" onClick={handleRename}>
            이름변경
          </Button>
          <DialogClose asChild>
            <Button type="button">취소</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
