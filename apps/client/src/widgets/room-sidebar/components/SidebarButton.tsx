import { cn } from '@codejam/ui';

interface SidebarButtonProps {
  isActive: boolean;
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
        'group relative flex h-10 w-10 items-center justify-center rounded-md duration-300 ease-in-out',
        isActive
          ? 'text-sidebar-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50',
      )}
    >
      {isActive && (
        <div className="bg-primary absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full" />
      )}

      <span
        className={cn(
          'relative transition-colors duration-300',
          isActive && 'text-primary',
        )}
      >
        {icon}
      </span>
    </button>
  );
}
