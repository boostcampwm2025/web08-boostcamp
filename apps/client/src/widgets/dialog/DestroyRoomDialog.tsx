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
  AlertDialogTrigger,
} from '@codejam/ui';
import { socket } from '@/shared/api/socket';
import { SOCKET_EVENTS } from '@codejam/common';
import { type FormEvent } from 'react';
import BombIcon from '@/assets/fa-bomb.svg?react';

type DestroyRoomDialogProps = {
  children: React.ReactElement;
};

export function DestroyRoomDialog({ children }: DestroyRoomDialogProps) {
  const handleDestroy = (ev: FormEvent) => {
    ev.preventDefault();
    socket.emit(SOCKET_EVENTS.DESTROY_ROOM);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger render={children} />
      <AlertDialogContent size="sm">
        <form onSubmit={handleDestroy} className="contents">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <BombIcon className="h-6 w-6" />
            </AlertDialogMedia>
            <AlertDialogTitle>정말 방을 폭파할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              폭파하면 모든 참가자가 퇴장되고
              <br />
              방의 모든 내용이 영구적으로 삭제돼요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction type="submit" variant="destructive">
              폭파하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
