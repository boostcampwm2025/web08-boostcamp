import { usePt } from '@/stores/pts';
import { useRoomStore } from '@/stores/room';
import type { EditableProps, ParticipantProps } from '../lib/types';
import { ParticipantName } from './ParticipantName';
import { RoleSwitcher } from './RoleSwitcher';
import { HostClaimSwitcher } from './HostClaimSwitcher';

/**
 * 참가자의 상세 정보를 표시하는 컴포넌트
 * - 닉네임, 해시태그, 본인 여부 표시
 * - 역할(Role) 뱃지 및 역할 변경 UI 제공
 */
export function ParticipantInfo({
  ptId,
  editable,
  onEditable,
  canToggle,
  onToggleRole,
}: ParticipantProps & EditableProps) {
  const pt = usePt(ptId);
  const myPtId = useRoomStore((state) => state.myPtId);
  const roomType = useRoomStore((state) => state.roomType);
  const hasHostPassword = useRoomStore((state) => state.hasHostPassword);

  if (!pt) return null;

  const { nickname, ptHash, role } = pt;
  const isMe = myPtId === ptId;

  // 호스트 배지는 절대 클릭 불가
  const isInteractive = !!(canToggle && role !== 'host');

  // 본인 + Custom Room + 비호스트 + hostPassword 있음 → 호스트 권한 요청 UI 표시
  const showHostClaimSwitcher =
    isMe && roomType === 'custom' && role !== 'host' && hasHostPassword;

  return (
    <div className="flex flex-col min-w-0 gap-1">
      <ParticipantName
        editable={editable}
        onEditable={onEditable}
        nickname={nickname}
        ptHash={ptHash}
        ptId={ptId}
        isMe={isMe}
      />

      <div className="flex items-center h-6">
        {showHostClaimSwitcher ? (
          <HostClaimSwitcher role={role} hasHostPassword={hasHostPassword} />
        ) : (
          <RoleSwitcher
            role={role}
            isInteractive={isInteractive}
            onToggle={onToggleRole}
          />
        )}
      </div>
    </div>
  );
}
