import { usePt } from '@/stores/pts';
import { useRoomStore } from '@/stores/room';
import { ROLE_BADGE_STYLES, getRoleDisplayText } from '../lib/types';
import type { ParticipantProps } from '../lib/types';
import { cn } from '@/shared/lib/utils';

export function ParticipantInfo({ ptId }: ParticipantProps) {
  const pt = usePt(ptId);
  const myPtId = useRoomStore((state) => state.myPtId);

  if (!pt) return null;

  const { nickname, ptHash, role } = pt;
  const roleText = getRoleDisplayText(role);
  const isMe = myPtId === ptId;

  return (
    <div>
      <div className="flex flex-col min-w-0 gap-1">
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
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className={cn(
              'text-[10px] px-1.5 py-0.5 rounded-md border font-medium uppercase tracking-wide',
              ROLE_BADGE_STYLES[role],
            )}
          >
            {roleText}
          </span>
        </div>
      </div>
    </div>
  );
}
