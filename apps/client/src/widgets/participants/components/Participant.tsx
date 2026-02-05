import { memo } from 'react';
import { Pencil } from 'lucide-react';
import { PRESENCE, ROLE } from '@codejam/common';
import { cn } from '@codejam/ui';
import { ParticipantAvatar } from '../ui';
import type { ParticipantProps } from '../lib/types';
import { ROLE_BADGE_STYLES } from '../lib/types';
import { HostPasswordDialog } from '@/widgets/dialog/HostPasswordDialog';
import { useParticipant } from '../lib/hooks/useParticipant';

export const Participant = memo(({ ptId }: ParticipantProps) => {
  const {
    pt,
    isMe,
    canManageRole,
    showHostClaimSwitcher,
    nickname,
    hostPassword,
    role,
  } = useParticipant(ptId);

  const isEditMode = isMe && nickname.isEditing;

  if (!pt) return null;

  return (
    <div className="hover:bg-accent flex items-center justify-between rounded-xs p-2 transition-colors select-none">
      <div
        className={cn(
          'flex items-center gap-3',
          pt.presence !== PRESENCE.ONLINE && 'opacity-40',
        )}
      >
        <ParticipantAvatar ptId={ptId} />

        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-col gap-0.5">
            <div
              onClick={isEditMode ? undefined : nickname.handleClick}
              className={`group flex min-w-0 items-center gap-1 ${
                isEditMode ? '' : 'cursor-pointer'
              }`}
            >
              <input
                type="text"
                className={cn(
                  'bg-transparent text-sm font-semibold text-gray-900 outline-none dark:text-gray-100',
                  'border-b border-transparent transition-colors',
                  isEditMode
                    ? 'border-muted-foreground field-sizing-content'
                    : 'group-hover:border-muted-foreground/50 pointer-events-none field-sizing-content truncate',
                )}
                value={isEditMode ? nickname.value : pt.nickname}
                onChange={nickname.handleChange}
                onKeyDown={nickname.handleKeyDown}
                onBlur={nickname.handleSubmit}
                readOnly={!isEditMode}
                autoFocus={isEditMode}
              />
              {isMe && (
                <Pencil
                  className={cn(
                    'text-muted-foreground size-3 shrink-0',
                    isEditMode
                      ? ''
                      : 'opacity-0 transition-opacity group-hover:opacity-100',
                  )}
                />
              )}
            </div>
            {nickname.error && (
              <span className="text-xs text-red-500">{nickname.error}</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {pt.ptHash && (
              <span className="font-mono text-xs text-gray-400 dark:text-gray-500">
                #{pt.ptHash}
              </span>
            )}

            {showHostClaimSwitcher ? (
              <>
                <div
                  className={cn(
                    'animate-in fade-in zoom-in-95 relative flex h-6 w-26 cursor-pointer items-center rounded-md bg-gray-200 p-0.5 duration-200 select-none dark:bg-gray-700',
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    hostPassword.onOpenChange(true);
                  }}
                >
                  <div className="absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-sm bg-white shadow-sm dark:bg-gray-600" />
                  <div
                    className={cn(
                      'z-10 flex-1 text-center text-[10px] font-bold tracking-wider uppercase transition-colors',
                      pt.role === ROLE.EDITOR
                        ? 'text-blue-600 dark:text-blue-300'
                        : 'text-gray-800 dark:text-gray-100',
                    )}
                  >
                    {role.displayText}
                  </div>
                  <div className="z-10 flex-1 text-center text-[10px] font-bold tracking-wider text-gray-400 uppercase transition-colors dark:text-gray-500">
                    Host
                  </div>
                </div>

                <HostPasswordDialog
                  open={hostPassword.isOpen}
                  onOpenChange={hostPassword.onOpenChange}
                  onConfirm={hostPassword.onConfirm}
                />
              </>
            ) : (
              <>
                {canManageRole && !isMe && pt.role !== ROLE.HOST ? (
                  <div
                    className="animate-in fade-in zoom-in-95 relative flex h-6 w-26 cursor-pointer items-center rounded-md bg-gray-200 p-0.5 duration-200 select-none dark:bg-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      role.toggle();
                    }}
                  >
                    <div
                      className={cn(
                        'absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-sm bg-white shadow-sm transition-transform duration-200 ease-out dark:bg-gray-600',
                        role.isEditor
                          ? 'left-0.5 translate-x-full'
                          : 'left-0.5',
                      )}
                    />
                    <div
                      className={cn(
                        'z-10 flex-1 text-center text-[10px] font-bold tracking-wider uppercase transition-colors',
                        !role.isEditor
                          ? 'text-gray-800 dark:text-gray-100'
                          : 'text-gray-400 dark:text-gray-500',
                      )}
                    >
                      Viewer
                    </div>
                    <div
                      className={cn(
                        'z-10 flex-1 text-center text-[10px] font-bold tracking-wider uppercase transition-colors',
                        role.isEditor
                          ? 'text-blue-600 dark:text-blue-300'
                          : 'text-gray-400 dark:text-gray-500',
                      )}
                    >
                      Editor
                    </div>
                  </div>
                ) : (
                  <span
                    className={cn(
                      'cursor-default rounded-md border px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase',
                      ROLE_BADGE_STYLES[pt.role],
                      'opacity-90',
                    )}
                  >
                    {role.displayText}
                  </span>
                )}
              </>
            )}

            {isMe && (
              <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300">
                YOU
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
