import { Badge } from '@codejam/ui';
import type { PtRole } from '@codejam/common';
import { ROLE_BADGE_STYLES } from '@/widgets/participants/lib/types';

interface RoleBadgeProps {
  role?: PtRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  if (!role) return null;

  return (
    <>
      <Badge className={ROLE_BADGE_STYLES[role]}>
        <span className="relative mr-1 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
        {role.toUpperCase()}
      </Badge>
    </>
  );
}
