import { usePt } from '@/stores/pts';
import { useRoomStore } from '@/stores/room';
import { ROLE_BADGE_STYLES, getRoleDisplayText } from '../lib/types';
import type { ParticipantProps } from '../lib/types';
import { cn } from '@/shared/lib/utils';

export function ParticipantInfo({
  ptId,
  canToggle,
  onToggleRole,
}: ParticipantProps) {
  const pt = usePt(ptId);
  const myPtId = useRoomStore((state) => state.myPtId);

  if (!pt) return null;

  const { nickname, ptHash, role } = pt;
  const roleText = getRoleDisplayText(role);
  const isMe = myPtId === ptId;

  // 호스트 배지는 절대 클릭 불가
  const isInteractive = canToggle && role !== 'host';
  const isEditor = role === 'editor';

  return (
    <div className="flex flex-col min-w-0 gap-1">
      {/* 1. 상단 정보 */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {nickname}
        </span>
        {ptHash && (
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
            #{ptHash}
          </span>
        )}
        {isMe && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300">
            YOU
          </span>
        )}
      </div>

      {/* 2. 하단: 배지 & 스위치 영역 */}
      <div className="flex items-center h-6">
        {isInteractive ? (
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
                onToggleRole?.();
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
        ) : (
          // [Non-Interactive] 권한이 없거나 호스트인 경우
          <span
            className={cn(
              'text-[10px] px-1.5 py-0.5 rounded-md border font-medium uppercase tracking-wide cursor-default',
              ROLE_BADGE_STYLES[role],
              'opacity-90',
            )}
          >
            {roleText}
          </span>
        )}
      </div>
    </div>
  );
}
