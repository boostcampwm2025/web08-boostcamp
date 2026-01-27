import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { RadixButton as Button } from '@codejam/ui';
import { toast } from 'sonner';

interface RoomCodeProps {
  roomCode: string;
}

export function RoomCode({ roomCode }: RoomCodeProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode || '');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast.success('방 코드가 복사되었습니다.');
    } catch (err) {
      const error = err as Error;
      toast.error(`복사에 실패했습니다: ${error.message}`);
    }
  };

  return (
    <div className="ml-2 flex shrink-0 items-center gap-2 sm:ml-6">
      <span className="text-muted-foreground hidden text-xs font-semibold tracking-wider uppercase md:block">
        ROOM CODE
      </span>
      <div className="border-border bg-secondary/50 flex items-center gap-1 rounded-md border px-2 py-1 sm:gap-2 sm:px-3 sm:py-1.5">
        <span className="max-w-[80px] truncate font-mono text-xs font-semibold sm:max-w-none sm:text-sm">
          {roomCode}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 p-0 hover:bg-transparent"
          onClick={copyRoomCode}
        >
          {isCopied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  );
}
