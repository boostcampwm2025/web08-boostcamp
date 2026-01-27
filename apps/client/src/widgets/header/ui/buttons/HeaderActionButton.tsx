import { RadixButton as Button } from '@codejam/ui';
import type { ComponentProps } from 'react';

type HeaderActionButtonProps = ComponentProps<typeof Button>;

export function HeaderActionButton({
  children,
  className,
  ...props
}: HeaderActionButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`h-8 gap-1.5 px-2 text-xs sm:px-3 ${className || ''}`}
      {...props}
    >
      {children}
    </Button>
  );
}
