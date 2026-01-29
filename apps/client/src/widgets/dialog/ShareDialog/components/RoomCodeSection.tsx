import { RadixButton as Button } from '@codejam/ui';
import { Check, Copy } from 'lucide-react';

interface Props {
  roomCode: string;
  copied: boolean;
  onCopy: () => void;
}

export const RoomCodeSection = ({ roomCode, copied, onCopy }: Props) => (
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
        onClick={onCopy}
        className="bg-brand-green hover:bg-brand-green/90 flex h-auto shrink-0 gap-2 rounded-xl px-6 text-white shadow-sm transition-all active:scale-95"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? '완료' : '복사'}
      </Button>
    </div>
  </div>
);
