import { RadixButton as Button } from '@codejam/ui';
import {
  RadixDialog as Dialog,
  RadixDialogContent as DialogContent,
  RadixDialogDescription as DialogDescription,
  RadixDialogHeader as DialogHeader,
  RadixDialogTitle as DialogTitle,
  RadixDialogTrigger as DialogTrigger,
} from '@codejam/ui';
import { RadixInput as Input } from '@codejam/ui';
import { Check, Copy, Users } from 'lucide-react';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

type ShareDialogProps = {
  children: React.ReactNode;
  roomCode: string;
};

export function ShareDialog({ children, roomCode }: ShareDialogProps) {
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const inviteUrl = `${window.location.origin}/rooms/${roomCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-card text-card-foreground overflow-hidden rounded-3xl border-none p-0 shadow-xl sm:max-w-[480px]">
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
          <div className="mb-8 space-y-3">
            <span className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
              Room Code
            </span>
            <div className="flex gap-2">
              <div className="border-border bg-muted/30 flex flex-1 items-center justify-center rounded-xl border-2 border-dashed py-4">
                <span className="text-foreground font-mono text-3xl font-bold tracking-[0.3em]">
                  {roomCode}
                </span>
              </div>
              <Button
                onClick={handleCopyCode}
                className="bg-brand-green hover:bg-brand-green/90 flex h-auto shrink-0 gap-2 rounded-xl px-6 text-white shadow-sm transition-all active:scale-95"
              >
                {codeCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {codeCopied ? '완료' : '복사'}
              </Button>
            </div>
            <p className="text-muted-foreground text-center text-xs">
              홈페이지에서 이 코드를 입력하여 즉시 참여할 수 있습니다.
            </p>
          </div>

          {/* 구분선 */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <span className="border-border w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card text-muted-foreground px-4 font-medium">
                또는 다음 방법으로 초대
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {/* 초대 링크 & 공유 버튼 */}
            <div className="space-y-6">
              <div className="space-y-3">
                <span className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
                  Invite Link
                </span>
                <div className="relative">
                  <Input
                    readOnly
                    value={inviteUrl}
                    className="bg-muted/50 text-muted-foreground h-10 rounded-lg pr-10 text-xs"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="hover:text-brand-green absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                  >
                    {linkCopied ? (
                      <Check className="text-brand-green h-4 w-4" />
                    ) : (
                      <Copy className="text-muted-foreground h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  이 링크를 통해 바로 접속할 수 있습니다.
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
                  Share Via
                </span>
                {/* TODO: 여기에 외부 서비스 공유 버튼 추가 */}
              </div>
            </div>

            {/* QR 코드 */}
            <div className="border-border/50 flex flex-col items-center justify-center space-y-3 border-l pl-4 sm:border-l">
              <span className="text-muted-foreground mb-1 text-[11px] font-bold tracking-widest uppercase">
                Scan to Join
              </span>

              <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <QRCodeSVG
                  value={inviteUrl}
                  size={110}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>
              <p className="text-muted-foreground text-center text-[11px] leading-tight">
                모바일이나 태블릿에서
                <br />
                빠르게 접속하세요.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
