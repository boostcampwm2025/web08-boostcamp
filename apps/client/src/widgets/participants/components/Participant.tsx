import { memo } from 'react';
import { Pencil } from 'lucide-react';
import { LIMITS, PRESENCE, ROLE } from '@codejam/common';
import { cn } from '@codejam/ui';
import { ParticipantAvatar, RoleToggleBadge } from '../ui';
import { type ParticipantProps } from '../lib/types';
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
    <div
      className={cn(
        'hover:bg-accent flex items-center justify-between rounded-sm p-2 transition-colors select-none',
        'flex items-center gap-3',
        pt.presence !== PRESENCE.ONLINE && 'opacity-40',
      )}
    >
      <div className="flex flex-1 gap-3">
        <ParticipantAvatar ptId={ptId} />

        <div className="flex min-w-0 flex-col gap-1">
          <div className="g flex flex-col">
            <div
              onClick={isEditMode ? undefined : nickname.handleClick}
              className={`group flex min-w-0 items-center ${
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
                maxLength={LIMITS.NICKNAME_MAX}
                value={isEditMode ? nickname.value : pt.nickname}
                onChange={nickname.handleChange}
                onKeyDown={nickname.handleKeyDown}
                onBlur={nickname.handleSubmit}
                readOnly={!isEditMode}
                autoFocus={isEditMode}
              />
              {isMe && (
                <>
                  <Pencil
                    className={cn(
                      'text-muted-foreground size-3 shrink-0',
                      isEditMode
                        ? ''
                        : 'opacity-0 transition-opacity group-hover:opacity-100',
                    )}
                  />
                  {/* <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300">
                    YOU
                  </span> */}
                </>
              )}
            </div>
            {nickname.error ? (
              <span className="text-xs text-red-500">{nickname.error}</span>
            ) : (
              <div className="flex items-center gap-1">
                {pt.ptHash && (
                  <span className="font-mono text-xs text-gray-400 dark:text-gray-500">
                    #{pt.ptHash}
                  </span>
                )}

                {showHostClaimSwitcher ? (
                  <>
                    <RoleToggleBadge
                      role={pt.role}
                      mode="hostClaim"
                      displayText={role.displayText}
                      onHostClaim={() => hostPassword.onOpenChange(true)}
                    />
                    <HostPasswordDialog
                      open={hostPassword.isOpen}
                      onOpenChange={hostPassword.onOpenChange}
                      onConfirm={hostPassword.onConfirm}
                    />
                  </>
                ) : (
                  <>
                    {canManageRole && !isMe && pt.role !== ROLE.HOST ? (
                      <RoleToggleBadge
                        role={pt.role}
                        mode="roleToggle"
                        isEditor={role.isEditor}
                        onToggle={role.toggle}
                      />
                    ) : (
                      <RoleToggleBadge
                        role={pt.role}
                        mode="static"
                        displayText="YOU"
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <RoleToggleBadge
          role={pt.role}
          mode="static"
          displayText={role.displayText}
        />
      </div>
    </div>
  );
});
