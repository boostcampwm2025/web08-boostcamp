import { usePt } from '@/stores/pts';
import { useRoomStore } from '@/stores/room';
import type { ParticipantProps } from '../lib/types';
import { ParticipantName } from './ParticipantName';
import { RoleSwitcher } from './RoleSwitcher';

export function ParticipantInfo({
  ptId,
  canToggle,
  onToggleRole,
}: ParticipantProps) {
  const pt = usePt(ptId);
  const myPtId = useRoomStore((state) => state.myPtId);

  if (!pt) return null;

  const { nickname, ptHash, role } = pt;
  const isMe = myPtId === ptId;

  // 호스트 배지는 절대 클릭 불가
  const isInteractive = !!(canToggle && role !== 'host');

  return (
    <div className="flex flex-col min-w-0 gap-1">
      <ParticipantName nickname={nickname} ptHash={ptHash} isMe={isMe} />

      <div className="flex items-center h-6">
        <RoleSwitcher
          role={role}
          isInteractive={isInteractive}
          onToggle={onToggleRole}
        />
      </div>
    </div>
  );
}
