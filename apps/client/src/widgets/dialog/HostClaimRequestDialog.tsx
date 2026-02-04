import { useEffect, useState } from 'react';
import { Button } from '@codejam/ui';
import {
  RadixDialog as Dialog,
  RadixDialogContent as DialogContent,
  RadixDialogDescription as DialogDescription,
  RadixDialogFooter as DialogFooter,
  RadixDialogHeader as DialogHeader,
  RadixDialogTitle as DialogTitle,
} from '@codejam/ui';
import { socket } from '@/shared/api/socket';
import { SOCKET_EVENTS } from '@codejam/common';
import { useHostClaimStore } from '@/stores/hostClaim';

const TIMEOUT_SECONDS = 10;

export function HostClaimRequestDialog() {
  const { isRequestModalOpen, requesterNickname, closeRequestModal } =
    useHostClaimStore();
  const [countdown, setCountdown] = useState(TIMEOUT_SECONDS);

  // 카운트다운 타이머
  useEffect(() => {
    if (!isRequestModalOpen) {
      queueMicrotask(() => setCountdown(TIMEOUT_SECONDS));
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRequestModalOpen]);

  const handleAccept = () => {
    socket.emit(SOCKET_EVENTS.ACCEPT_HOST_CLAIM);
    closeRequestModal();
  };

  const handleReject = () => {
    socket.emit(SOCKET_EVENTS.REJECT_HOST_CLAIM);
    closeRequestModal();
  };

  return (
    <Dialog
      open={isRequestModalOpen}
      onOpenChange={(open) => {
        // X 버튼 클릭 시 거절 처리
        if (!open) {
          handleReject();
        }
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>호스트 권한 요청</DialogTitle>
          <DialogDescription className="mt-2">
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {requesterNickname}
            </span>
            님이 호스트 권한을 요청했습니다.
            <br />
            <br />
            <span className="text-muted-foreground">
              {countdown}초 후 자동으로 수락됩니다.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex-row justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleReject}
          >
            거절
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAccept}
            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
          >
            수락
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
