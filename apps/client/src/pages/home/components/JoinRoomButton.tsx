import { Loader2 } from 'lucide-react';
import { Button } from '@codejam/ui';

interface JoinRoomButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

export function JoinRoomButton({
  onClick,
  disabled,
  isLoading,
}: JoinRoomButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="bg-brand-green w-full rounded-xl p-7 text-xl text-white shadow-md transition-all hover:bg-emerald-600"
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-3">
          <Loader2 className="size-7 animate-spin" />
          입장 중
        </span>
      ) : (
        '입장하기'
      )}
    </Button>
  );
}
