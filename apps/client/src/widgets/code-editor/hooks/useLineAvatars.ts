import { useEffect, useRef, useState } from 'react';
import type { Awareness } from 'y-protocols/awareness';
import { type RemoteUser } from '../plugin/LineAvatars';

/**
 * Awareness를 구독하여 현재 접속 중인 유저들의 Raw Data를 반환.
 */
export function useLineAvatars(
  awareness: Awareness | undefined,
  fileId: string | undefined,
): RemoteUser[] {
  const [users, setUsers] = useState<RemoteUser[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!awareness || !fileId) return;

    const handleAwarenessChange = () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        const states = awareness.getStates();
        const activeUsers: RemoteUser[] = [];

        states.forEach((state, clientID) => {
          if (clientID === awareness.clientID) return; // 나 자신 제외

          const cursor = state.cursor;
          const user = (state.user as RemoteUser) || {};

          // 필수 데이터 검증
          if (!user.hash || !cursor || !cursor.anchor) return;
          // if (user.currentFileId && user.currentFileId !== fileId) return;

          activeUsers.push({
            hash: user.hash,
            color: user.color,
            name: user.name,
            cursor: cursor.anchor, // RelativePosition 저장
          });
        });

        setUsers(activeUsers);
      }, 50);
    };

    handleAwarenessChange();
    awareness.on('change', handleAwarenessChange);
    awareness.on('update', handleAwarenessChange);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      awareness.off('change', handleAwarenessChange);
      awareness.off('update', handleAwarenessChange);
    };
  }, [awareness, fileId]);

  return users;
}
