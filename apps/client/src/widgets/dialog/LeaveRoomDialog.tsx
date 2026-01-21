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
          <DialogDescription>정말로 방을 나가시겠습니까?</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
          >
            나가기
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary" size="sm">
              취소
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
