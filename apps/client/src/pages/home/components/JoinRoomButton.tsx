import { RadixButton as Button } from '@codejam/ui';

interface JoinRoomButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export function JoinRoomButton({
  onClick,
  isLoading,
  disabled,
}: JoinRoomButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="bg-brand-green h-14 w-full rounded-xl text-lg font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
    >
      {isLoading ? '입장 중...' : '입장하기'}
    </Button>
  );
}
