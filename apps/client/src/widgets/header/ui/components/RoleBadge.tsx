import type { PtRole } from '@codejam/common';
import { cn } from '@codejam/ui';
import { ROLE_BADGE_STYLES } from '@/widgets/participants/lib/types';

interface RoleBadgeProps {
  role?: PtRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  if (!role) return null;

  return (
    <div
      className={cn(
        'relative flex h-6 w-auto items-center justify-center gap-2 rounded-full p-0.5 px-3',
        ROLE_BADGE_STYLES[role],
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
      </span>
      <div className="flex w-full justify-center">
        <span className="z-10 text-[10px] font-bold uppercase select-none">
          {role.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
