import {
  DialogDescription,
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from '@codejam/ui';
import { Check, Copy } from 'lucide-react';

interface Props {
  roomCode: string;
  copied: boolean;
  onCopy: () => void;
}

export const RoomCodeSection = ({ roomCode, copied, onCopy }: Props) => (
  <div className="space-y-2">
    <DialogDescription>Room Code</DialogDescription>
    <InputGroup className="h-16 w-full">
      <InputGroupInput
        type="text"
        value={roomCode}
        readOnly
        className="h-full text-center font-mono text-3xl font-bold tracking-widest md:text-3xl"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-sm"
          onClick={onCopy}
          type="button"
          title="방 코드 복사"
          className="h-12 w-12"
        >
          {copied ? (
            <Check className="size-6 text-green-500" />
          ) : (
            <Copy className="size-6" />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  </div>
);
