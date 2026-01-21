import { Button } from '@/shared/ui/button';
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
      className={`gap-1.5 text-xs h-8 px-2 sm:px-3 ${className || ''}`}
      {...props}
    >
      {children}
    </Button>
  );
}
