import { cn } from '@codejam/ui';

interface SidebarButtonProps {
  isActive?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

export function SidebarButton({
  isActive,
  onClick,
  icon,
  label,
}: SidebarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        'group flex w-full flex-col items-center justify-center gap-1 py-2.5 transition-colors duration-200',
        'rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2',
        isActive
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200',
          isActive ? 'bg-primary/10' : 'group-hover:bg-muted/60',
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          'text-[11px] leading-none font-medium transition-colors',
          isActive
            ? 'text-primary font-semibold'
            : 'text-muted-foreground group-hover:text-foreground',
        )}
      >
        {label}
      </span>
    </button>
  );
}
