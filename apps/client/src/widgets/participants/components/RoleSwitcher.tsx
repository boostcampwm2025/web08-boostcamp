import { cn } from '@codejam/ui';
import { ROLE_BADGE_STYLES, getRoleDisplayText } from '../lib/types';
import { ROLE, type Pt } from '@codejam/common';

interface RoleSwitcherProps {
  role: Pt['role'];
  isInteractive: boolean;
  onToggle?: () => void;
}

/**
 * 역할(Role)을 표시하고 변경할 수 있는 스위처 컴포넌트
 * - 기본: 정적 뱃지 표시
 * - 호버 시 (권한 있는 경우): Viewer ↔ Editor 전환 UI 표시
 */
export function RoleSwitcher({
  role,
  isInteractive,
  onToggle,
}: RoleSwitcherProps) {
  const roleText = getRoleDisplayText(role);
  const isEditor = role === ROLE.EDITOR;

  if (!isInteractive) {
    // [Non-Interactive] 권한이 없거나 호스트인 경우
    return (
      <span
        className={cn(
          'cursor-default rounded-md border px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase',
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
            'rounded-md border px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase',
            ROLE_BADGE_STYLES[role],
            'opacity-90',
          )}
        >
          {roleText}
        </span>
      </div>

      {/* [State B] Interactive Switch */}
      <div
        className="animate-in fade-in zoom-in-95 relative hidden h-6 w-[104px] cursor-pointer items-center rounded-md bg-gray-200 p-0.5 duration-200 select-none group-hover:flex dark:bg-gray-700"
        onClick={(e) => {
          e.stopPropagation();
          onToggle?.();
        }}
      >
        {/* Sliding Pill */}
        <div
          className={cn(
            'absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-sm bg-white shadow-sm transition-transform duration-200 ease-out dark:bg-gray-600',
            isEditor ? 'left-0.5 translate-x-full' : 'left-0.5',
          )}
        />

        {/* Viewer Label */}
        <div
          className={cn(
            'z-10 flex-1 text-center text-[10px] font-bold tracking-wider uppercase transition-colors',
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
            'z-10 flex-1 text-center text-[10px] font-bold tracking-wider uppercase transition-colors',
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
