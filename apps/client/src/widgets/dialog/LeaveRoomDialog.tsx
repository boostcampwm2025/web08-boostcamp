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
import { type FormEvent } from 'react';
import { LogOut } from 'lucide-react';

interface LeaveRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function LeaveRoomDialog({
  open,
  onOpenChange,
  onConfirm,
}: LeaveRoomDialogProps) {
  const handleLeave = (ev: FormEvent) => {
    ev.preventDefault();
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <form onSubmit={handleLeave} className="contents">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <LogOut />
            </AlertDialogMedia>
            <AlertDialogTitle>방을 나가시겠어요?</AlertDialogTitle>
            <AlertDialogDescription>
              나가시면 작성 중인 코드와 채팅 기록을 <br />더 이상 확인할 수
              없어요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">취소</AlertDialogCancel>
            <AlertDialogAction type="submit" variant="destructive">
              나가기
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
