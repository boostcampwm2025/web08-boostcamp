import { Button } from '@codejam/ui';
import { Zap } from 'lucide-react';

interface QuickStartButtonProps extends React.ComponentPropsWithoutRef<
  typeof Button
> {
  isLoading: boolean;
  hasError: boolean;
}

export function QuickStartButton({
  isLoading,
  hasError,
  ...props
}: QuickStartButtonProps) {
  return (
    <Button
      {...props}
      disabled={isLoading}
      className={`group w-full rounded-xl p-7 font-mono text-xl text-white shadow-md transition-all ${hasError ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}
    >
      {isLoading ? (
        'Creating...'
      ) : (
        <>
          Quick Start
          <Zap
            className="group-hover:animate-buzz size-6 text-yellow-400"
            fill="currentColor"
          />
        </>
      )}
    </Button>
  );
}
