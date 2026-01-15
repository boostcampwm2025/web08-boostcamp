import { socket } from '@/shared/api/socket';
import { Button } from '@/shared/ui';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
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
        <DialogFooter className="sm:justify-start mt-4">
          <Button
            type="submit"
            variant="default"
            size="sm"
            className="text-red-400 border border-red-400"
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
