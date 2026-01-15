import { cn } from '@/shared/lib/utils';
import { ROLE_BADGE_STYLES, getRoleDisplayText } from '../lib/types';
import type { Pt } from '@codejam/common';

interface RoleSwitcherProps {
  role: Pt['role'];
  isInteractive: boolean;
  onToggle?: () => void;
}

export function RoleSwitcher({
  role,
  isInteractive,
  onToggle,
}: RoleSwitcherProps) {
  const roleText = getRoleDisplayText(role);
  const isEditor = role === 'editor';

  if (!isInteractive) {
    // [Non-Interactive] 권한이 없거나 호스트인 경우
    return (
      <span
        className={cn(
          'text-[10px] px-1.5 py-0.5 rounded-md border font-medium uppercase tracking-wide cursor-default',
          ROLE_BADGE_STYLES[role],
          'opacity-90',
        )}
      >
        {roleText}
      </span>
    );
  }

  return (
    <>
      {/* [State A] Static Badge */}
      <div className="block group-hover:hidden">
        <span
          className={cn(
            'text-[10px] px-1.5 py-0.5 rounded-md border font-medium uppercase tracking-wide',
            ROLE_BADGE_STYLES[role],
            'opacity-90',
          )}
        >
          {roleText}
        </span>
      </div>

      {/* [State B] Interactive Switch */}
      <div
        className="hidden group-hover:flex relative items-center bg-gray-200 dark:bg-gray-700 rounded-md p-0.5 cursor-pointer w-[104px] h-6 select-none animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => {
          e.stopPropagation();
          onToggle?.();
        }}
      >
        {/* Sliding Pill */}
        <div
          className={cn(
            'absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-sm bg-white dark:bg-gray-600 shadow-sm transition-transform duration-200 ease-out',
            isEditor ? 'translate-x-full left-0.5' : 'left-0.5',
          )}
        />

        {/* Viewer Label */}
        <div
          className={cn(
            'z-10 flex-1 text-center text-[10px] font-bold uppercase tracking-wider transition-colors',
            !isEditor
              ? 'text-gray-800 dark:text-gray-100'
              : 'text-gray-400 dark:text-gray-500',
          )}
        >
          Viewer
        </div>

        {/* Editor Label */}
        <div
          className={cn(
            'z-10 flex-1 text-center text-[10px] font-bold uppercase tracking-wider transition-colors',
            isEditor
              ? 'text-blue-600 dark:text-blue-300'
              : 'text-gray-400 dark:text-gray-500',
          )}
        >
          Editor
        </div>
      </div>
    </>
  );
}
