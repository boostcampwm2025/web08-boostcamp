import { useMemo } from 'react';
import { createAvatarGenerator, AvvvatarsProvider } from '@codejam/ui';
import { usePt } from '@/stores/pts';
import type { ParticipantProps } from '../lib/types';
import { ROLE } from '@codejam/common';

export function ParticipantAvatar({ ptId }: ParticipantProps) {
  const pt = usePt(ptId);
  // const color = pt?.color;

  const { Avatar } = useMemo(() => {
    return createAvatarGenerator(new AvvvatarsProvider({ variant: 'shape' }));
  }, []);

  if (!pt) return null;

  const { ptHash, role } = pt;
  const badge =
    role === ROLE.HOST ? (
      <span className="text-yellow-500">👑</span>
    ) : undefined;

  return (
    <div className="rounded-full p-0.5">
      <Avatar id={ptHash} badge={badge} size={28} />
    </div>
  );
}
