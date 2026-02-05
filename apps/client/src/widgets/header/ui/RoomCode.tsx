import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
  toast,
} from '@codejam/ui';

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
    <InputGroup className="w-24">
      <InputGroupInput
        type="text"
        value={roomCode}
        readOnly
        className="font-mono text-xs font-semibold"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          onClick={copyRoomCode}
          type="button"
          title="방 코드 복사"
        >
          {isCopied ? (
            <Check className="size-4 text-green-500" />
          ) : (
            <Copy className="size-4" />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
