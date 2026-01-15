import { Avatar } from '@/shared/ui';
import { usePt } from '@/stores/pts';
import type { ParticipantProps } from '../types';

/**
 * 참가자의 아바타를 표시하는 컴포넌트
 * - 닉네임 첫 글자를 아바타에 표시
 * - 방장(host)인 경우 왕관 아이콘 표시
 */
export function ParticipantAvatar({ ptId }: ParticipantProps) {
  const pt = usePt(ptId);
  const { nickname, color, role } = pt;
  const initial = nickname.charAt(0);

  const badge =
    role === 'host' ? <span className="text-yellow-500">👑</span> : undefined;

  return <Avatar initial={initial} color={color} badge={badge} />;
}
