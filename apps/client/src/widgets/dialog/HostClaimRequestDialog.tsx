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
import { socket } from '@/shared/api/socket';
import { SOCKET_EVENTS } from '@codejam/common';
import { useHostClaimStore } from '@/stores/hostClaim';
import { ShieldAlertIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    <AlertDialog
      open={isRequestModalOpen}
      onOpenChange={(open) => {
        if (!open) handleReject();
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
            <ShieldAlertIcon className="size-6" />
          </AlertDialogMedia>
          <AlertDialogTitle>호스트 권한 요청</AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col gap-1">
            <span>
              <strong className="text-primary">{requesterNickname}</strong> 님이
              호스트가 되기를 요청했어요.
            </span>
            <span className="text-muted-foreground">
              {countdown}초 후 자동으로 요청이 수락돼요.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleReject} variant="outline">
            거절
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleAccept} variant="default">
            수락
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
