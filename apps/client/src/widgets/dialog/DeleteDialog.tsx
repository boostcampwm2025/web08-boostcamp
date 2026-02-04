import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@codejam/ui';
import { useFileStore } from '@/stores/file';
import { type FormEvent } from 'react';
import { Trash2Icon } from 'lucide-react';

type DeleteDialogProps = {
  fileId: string;
  fileName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteDialog({
  fileId,
  fileName,
  open,
  onOpenChange,
}: DeleteDialogProps) {
  const deleteFile = useFileStore((store) => store.deleteFile);

  const handleDelete = (ev: FormEvent) => {
    ev.preventDefault();
    deleteFile(fileId);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <form onSubmit={handleDelete} className="contents">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>
              <strong className="text-primary">{fileName}</strong> 파일을
              삭제할까요?
            </AlertDialogTitle>
            <AlertDialogDescription>
              삭제하면 되돌릴 수 없어요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">취소</AlertDialogCancel>
            <AlertDialogAction variant="destructive">삭제</AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
