import { useFileStore } from '@/stores/file';
import { usePtsStore } from '@/stores/pts';
import { useRoomStore } from '@/stores/room';
import { useEffect } from 'react';

/**
 * usePtStore와 Awareness 간의 데이터 불일치를 해결하는
 * 단방향 동기화 bridge
 */
export function useAwarenessSync() {
  const myPtId = useRoomStore((state) => state.myPtId);
  const myPt = usePtsStore((state) => (myPtId ? state.pts[myPtId] : null));

  const awareness = useFileStore((state) => state.awareness);

  useEffect(() => {
    if (!awareness || !myPt) return;

    const localState = awareness.getLocalState();
    const currentAwarenessUser = localState?.user || {};

    /**
     * 실제 데이터와 Awareness 데이터가 다를 때만 실행
     * 닉네임(name)과 색상(color)만 변하는 값이라 가정
     */
    const hasChanged =
      currentAwarenessUser.name !== myPt.nickname ||
      currentAwarenessUser.color !== myPt.color;

    if (hasChanged) {
      console.log(`[Sync] Updating identity: ${myPt.nickname}`);

      awareness.setLocalStateField('user', {
        name: myPt.nickname,
        color: myPt.color,
        id: myPt.ptId,
      });
    }
  }, [myPt?.nickname, myPt?.color, awareness, myPtId]);
}
