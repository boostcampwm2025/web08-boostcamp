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
        'group relative flex h-10 w-10 items-center justify-center rounded-lg duration-200',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <span className="relative">{icon}</span>
    </button>
  );
}
