import { useMemo } from 'react';
import {
  createAvatarGenerator,
  BoringAvatarProvider,
  DEFAULT_BORING_AVATAR_COLORS,
} from '@codejam/ui';
import { usePt } from '@/stores/pts';
import { adjustColor } from '@/shared/lib/utils/color';
import type { ParticipantProps } from '../lib/types';
import { ROLE } from '@codejam/common';

export function ParticipantAvatar({ ptId }: ParticipantProps) {
  const pt = usePt(ptId);
  const color = pt?.color;

  const { Avatar } = useMemo(() => {
    // 톤온톤 팔레트 생성
    const colors = color
      ? [
          color,
          adjustColor(color, 30),
          adjustColor(color, 50),
          adjustColor(color, -20),
          adjustColor(color, -40),
        ]
      : DEFAULT_BORING_AVATAR_COLORS;

    return createAvatarGenerator(
      new BoringAvatarProvider({ variant: 'beam', colors }),
    );
  }, [color]);

  if (!pt) return null;

  const { ptHash, role } = pt;
  const badge =
    role === ROLE.HOST ? (
      <span className="text-yellow-500">👑</span>
    ) : undefined;

  return (
    <div
      className="rounded-full border"
      style={{ borderColor: color || 'rgba(255, 255, 255, 0.2)' }}
    >
      <Avatar id={ptHash} badge={badge} size={28} />
    </div>
  );
}
