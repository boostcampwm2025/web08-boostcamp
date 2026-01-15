import { Avatar, AVATAR_ICONS } from '@/shared/ui';
import { usePt } from '@/stores/pts';
import type { ParticipantProps } from '../lib/types';
import { useMemo } from 'react';

/**
 * 참가자의 아바타를 표시하는 컴포넌트
 * - 닉네임 첫 글자를 아바타에 표시
 * - 방장(host)인 경우 왕관 아이콘 표시
 */
export function ParticipantAvatar({ ptId }: ParticipantProps) {
  const pt = usePt(ptId);
  if (!pt) return null;
  const { color, role, ptHash } = pt;

  const SelectedIcon = useMemo(() => {
    const str = ptHash!.slice(1);

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }

    return AVATAR_ICONS[hash % AVATAR_ICONS.length];
  }, [ptHash]);

  const badge =
    role === 'host' ? <span className="text-yellow-500">👑</span> : undefined;

  return <Avatar icon={SelectedIcon} color={color} badge={badge} size={32} />;
}
