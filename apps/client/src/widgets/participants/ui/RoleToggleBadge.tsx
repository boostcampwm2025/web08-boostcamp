import type { PtRole } from '@codejam/common';
import { cn } from '@codejam/ui';
import { ROLE_BADGE_STYLES } from '../lib/types';

export interface RoleToggleBadgeProps {
  role: PtRole;
  mode: 'hostClaim' | 'roleToggle' | 'static';
  isEditor?: boolean;
  onToggle?: () => void;
  onHostClaim?: () => void;
  displayText?: string;
}

export function RoleToggleBadge({
  role,
  mode,
  isEditor,
  onToggle,
  onHostClaim,
  displayText,
}: RoleToggleBadgeProps) {
  if (mode === 'static') {
    return (
      <div
        className={cn(
          'relative flex h-6 w-14 items-center rounded-full p-0.5',
          ROLE_BADGE_STYLES[role],
        )}
      >
        {/* <div className="absolute left-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
          </span>
        </div> */}

        <div className="flex w-full justify-center px-2">
          <span className="z-10 text-[10px] leading-0 font-bold uppercase select-none">
            {displayText || role.toUpperCase()}
          </span>
        </div>
      </div>
    );
  }

  const isRight = mode === 'roleToggle' && isEditor;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === 'hostClaim') {
      onHostClaim?.();
    } else {
      onToggle?.();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative flex h-6 w-14 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200',
        ROLE_BADGE_STYLES[role],
      )}
    >
      <div
        className={cn(
          'absolute flex h-5 w-5 items-center justify-center rounded-full bg-white/80 shadow-sm transition-[left] duration-200 ease-out',
          isRight ? 'left-[calc(100%-1.25rem-2px)]' : 'left-0.5',
        )}
      >
        {/* <span className="relative flex h-1.5 w-1.5">
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span> */}
      </div>

      <div className="flex w-full justify-center px-2">
        <span
          className={cn(
            'z-10 text-[10px] leading-0 font-bold uppercase select-none',
            isRight && 'hidden',
          )}
        >
          {mode === 'hostClaim' ? displayText || role.toUpperCase() : 'VIEWER'}
        </span>

        <span
          className={cn(
            'z-10 text-[10px] leading-0 font-bold uppercase select-none',
            !isRight && 'hidden',
          )}
        >
          {mode === 'hostClaim' ? 'HOST' : 'EDITOR'}
        </span>
      </div>
    </div>
  );
}
