import { RadixButton as Button, RadixInput as Input } from '@codejam/ui';
import { Check, Copy, Share2 } from 'lucide-react';

interface Props {
  inviteUrl: string;
  linkCopied: boolean;
  onCopy: () => void;
  onShare: () => void;
}

export const InviteLinkSection = ({
  inviteUrl,
  linkCopied,
  onCopy,
  onShare,
}: Props) => (
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
          onClick={onCopy}
          className="hover:text-brand-green absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
        >
          {linkCopied ? (
            <Check className="text-brand-green h-4 w-4" />
          ) : (
            <Copy className="text-muted-foreground h-4 w-4" />
          )}
        </button>
      </div>
    </div>
    <div className="space-y-3">
      <span className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
        Share Via
      </span>
      <Button
        onClick={onShare}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border-none bg-slate-100 text-slate-900 transition-all hover:bg-slate-200 dark:bg-white/10 dark:text-white"
      >
        <Share2 className="h-4 w-4" />
        <span className="text-sm font-medium">기기 공유하기</span>
      </Button>
    </div>
  </div>
);
