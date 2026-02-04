import {
  RadixDialog as Dialog,
  RadixDialogContent as DialogContent,
  RadixDialogDescription as DialogDescription,
  RadixDialogHeader as DialogHeader,
  RadixDialogTitle as DialogTitle,
  RadixDialogTrigger as DialogTrigger,
} from '@codejam/ui';
import { Users } from 'lucide-react';
import type { ShareDialogProps } from './libs/types';
import { useShare } from './libs/useShare';
import { RoomCodeSection } from './components/RoomCodeSection';
import { InviteLinkSection } from './components/InviteLinkSection';
import { QRCodeSection } from './components/QRCodeSection';

export function ShareDialog({ children, roomCode }: ShareDialogProps) {
  const inviteUrl = `${window.location.origin}/rooms/${roomCode}`;
  const {
    codeCopied,
    linkCopied,
    handleCopyCode,
    handleCopyLink,
    handleWebShare,
  } = useShare(roomCode, inviteUrl);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-card text-card-foreground overflow-hidden rounded-3xl border-none p-0 shadow-xl sm:max-w-120">
        <div className="p-8">
          <DialogHeader className="mb-8 flex flex-row items-center gap-4 space-y-0">
            <div className="bg-brand-green-50 dark:bg-brand-green/10 rounded-2xl p-3">
              <Users className="text-brand-green h-6 w-6" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-foreground text-xl font-bold">
                참여자 초대하기
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                세션에 참여할 수 있도록 링크를 공유하세요.
              </DialogDescription>
            </div>
          </DialogHeader>

          <RoomCodeSection
            roomCode={roomCode}
            copied={codeCopied}
            onCopy={handleCopyCode}
          />

          {/* 구분선 */}
          <div className="relative my-10 text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="border-border w-full border-t" />
            </div>
            <span className="bg-card text-muted-foreground relative px-4 text-xs font-medium">
              또는 다음 방법으로 초대
            </span>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <InviteLinkSection
              inviteUrl={inviteUrl}
              linkCopied={linkCopied}
              onCopy={handleCopyLink}
              onShare={handleWebShare}
            />
            <QRCodeSection inviteUrl={inviteUrl} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
