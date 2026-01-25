import { Avatar } from '@/shared/ui';
import { usePt } from '@/stores/pts';
import type { ParticipantProps } from '../lib/types';
import { getAvatarIcon } from '@/shared/ui/avatar-shared';
import { ROLE } from '@codejam/common';

/**
 * 참가자의 아바타를 표시하는 컴포넌트
 * - 닉네임 첫 글자를 아바타에 표시
 * - 방장(host)인 경우 왕관 아이콘 표시
 */
export function ParticipantAvatar({ ptId }: ParticipantProps) {
  const pt = usePt(ptId);

  if (!pt) return null;

  const SelectedIcon = getAvatarIcon(pt.ptHash);

  const { color, role } = pt;
  const badge =
    role === ROLE.HOST ? (
      <span className="text-yellow-500">👑</span>
    ) : undefined;

  return <Avatar icon={SelectedIcon} color={color} badge={badge} size={32} />;
}
