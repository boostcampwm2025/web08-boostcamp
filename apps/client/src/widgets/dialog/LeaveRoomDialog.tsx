import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { DialogClose } from '@radix-ui/react-dialog';

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
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>방 나가기</DialogTitle>
          <DialogDescription>
            이 방을 나가시겠습니까?
            <br />
            <br />
            <span className="text-destructive font-medium">
              퇴장 시 참가자의 모든 활동 정보가 삭제됩니다.
            </span>
            <br />
            모든 참가자가 퇴장하면 방이 자동으로 삭제됩니다.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
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
            onClick={handleConfirm}
          >
            나가기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
