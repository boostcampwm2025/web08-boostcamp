import { Button } from '@codejam/ui';
import {
  RadixDialogClose as DialogClose,
  RadixDialogContent as DialogContent,
  RadixDialogDescription as DialogDescription,
  RadixDialogFooter as DialogFooter,
  RadixDialogHeader as DialogHeader,
  RadixDialogTitle as DialogTitle,
} from '@codejam/ui';
import { useFileStore } from '@/stores/file';
import { type FormEvent } from 'react';

type DeleteDialogProps = {
  fileId: string;
  fileName: string;
  onOpen: (value: boolean) => void;
};

export function DeleteDialog({ fileId, fileName, onOpen }: DeleteDialogProps) {
  const deleteFile = useFileStore((store) => store.deleteFile);

  const handleOnSubmit = (ev: FormEvent) => {
    ev.preventDefault();

    // Delete file
    deleteFile(fileId);

    onOpen(false);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <form onSubmit={handleOnSubmit}>
        <DialogHeader>
          <DialogTitle>파일 삭제</DialogTitle>
          <DialogDescription className="mt-4">
            <span className="font-bold">{fileName}</span> 을 정말로
            삭제하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex-row justify-end gap-2 border-t pt-4">
          <DialogClose asChild>
            <Button type="button" variant="secondary" size="sm">
              취소
            </Button>
          </DialogClose>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-red-500"
          >
            삭제
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
