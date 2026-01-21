import { Button } from '@/shared/ui';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { socket } from '@/shared/api/socket';
import { SOCKET_EVENTS } from '@codejam/common';
import { type FormEvent } from 'react';

type DestroyRoomDialogProps = {
  children: React.ReactNode;
};

export function DestroyRoomDialog({ children }: DestroyRoomDialogProps) {
  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    socket.emit(SOCKET_EVENTS.DESTROY_ROOM);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>방 폭파</DialogTitle>
            <DialogDescription className="mt-2">
              정말로 이 방을 폭파하시겠습니까?
              <br />
              <br />
              <span className="text-destructive font-medium">
                모든 참가자가 퇴장되고 방이 삭제됩니다.
              </span>
              <br />
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end gap-2 mt-4 border-t pt-4">
            <DialogClose asChild>
              <Button type="button" variant="secondary" size="sm">
                취소
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-red-500 hover:bg-destructive/10"
            >
              폭파하기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
