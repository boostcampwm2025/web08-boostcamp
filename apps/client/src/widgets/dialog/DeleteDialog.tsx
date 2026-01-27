import { socket } from '@/shared/api/socket';
import { RadixButton as Button } from '@codejam/ui';
import {
  DialogClose,
  RadixDialogContent as DialogContent,
  RadixDialogDescription as DialogDescription,
  RadixDialogFooter as DialogFooter,
  RadixDialogHeader as DialogHeader,
  RadixDialogTitle as DialogTitle,
} from '@codejam/ui';
import { useFileStore } from '@/stores/file';
import { SOCKET_EVENTS } from '@codejam/common';
import { type FormEvent } from 'react';

type DeleteDialogProps = {
  fileId: string;
  fileName: string;
  onOpen: (value: boolean) => void;
};

export function DeleteDialog({ fileId, fileName, onOpen }: DeleteDialogProps) {
  const setActiveFile = useFileStore((store) => store.setActiveFile);
  const activeFileId = useFileStore((store) => store.activeFileId);

  const handleOnSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    socket.emit(SOCKET_EVENTS.DELETE_FILE, {
      fileId,
    });
    if (activeFileId === fileId) {
      setActiveFile('');
    }
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
        <DialogFooter className="mt-4 sm:justify-start">
          <Button
            type="submit"
            variant="default"
            size="sm"
            className="border border-red-400 text-red-400"
          >
            삭제
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary" size="sm">
              닫기
            </Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
