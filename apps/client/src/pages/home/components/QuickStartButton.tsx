import { RadixButton as Button } from '@codejam/ui';
import { Zap } from 'lucide-react';

interface QuickStartButtonProps {
  onClick: () => void;
  isLoading: boolean;
  hasError: boolean;
}

export function QuickStartButton({
  onClick,
  isLoading,
  hasError,
}: QuickStartButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      className={`group w-full rounded-xl p-8 font-mono text-2xl text-white shadow-md transition-all ${hasError ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}
    >
      {isLoading ? (
        'Creating...'
      ) : (
        <>
          Quick Start
          <Zap
            className="group-hover:animate-buzz size-7 text-yellow-400"
            fill="currentColor"
          />
        </>
      )}
    </Button>
  );
}
