import { useMemo, useState } from 'react';
import { Participant } from './Participant';
import { sorter } from './sorter';
import { usePt, usePtsStore } from '@/stores/pts';
import { useRoomStore } from '@/stores/room';
import type { Pt } from '@codejam/common';
import { ChevronDown } from 'lucide-react';

export function Participants() {
  const pts = usePtsStore((state) => state.pts);
  const myPtId = useRoomStore((state) => state.myPtId);

  // 내 정보와 권한 확인
  const meData = usePt(myPtId);
  const iAmHost = meData?.role === 'host';

  // UI 상태 관리
  const [isCollapsed, setIsCollapsed] = useState(false); // 리스트 접기/펼치기

  // 나/상대 분리 -> 정렬
  const { me, others, totalCount } = useMemo(() => {
    let allPts = Object.values(pts);
    const total = allPts.length;

    let myPt: Pt | undefined;
    const otherPts: Pt[] = [];

    allPts.forEach((p) => {
      if (p.ptId === myPtId) {
        myPt = p;
      } else {
        otherPts.push(p);
      }
    });

    // 나머지 정렬 로직
    otherPts.sort((a, b) => {
      // 우선 순위 1: 호스트는 맨 위로
      if (a.role === 'host') return -1;
      if (b.role === 'host') return 1;

      // 우선 순위 2
      return sorter(a, b);
    });

    return { me: myPt, others: otherPts, totalCount: total };
  }, [pts, myPtId]);

  return (
    <div className="w-full min-w-3xs bg-white dark:bg-gray-800 p-4 font-sans">
      {/* --- Header --- */}
      <div
        className="flex items-center justify-between -mx-4 px-4 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-200">
          <ChevronDown
            size={14}
            strokeWidth={3}
            className={`transition-transform duration-200 ${
              isCollapsed ? '-rotate-90' : 'rotate-0'
            }`}
          />
          <h2 className="text-sm font-semibold uppercase tracking-wider">
            PARTICIPANTS ({totalCount})
          </h2>
        </div>
      </div>

      {/* --- Content --- */}
      <div
        className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-full opacity-100'}`}
      >
        {me && <Participant ptId={me.ptId} hasPermission={false} />}

        {me && others.length > 0 && (
          <div className="mx-3 my-1 border-t border-gray-300 dark:border-gray-600 opacity-50" />
        )}

        {others.map((p) => (
          <Participant
            key={p.ptId}
            ptId={p.ptId}
            hasPermission={iAmHost} // 내가 호스트면 다른 사람 권한 수정 가능
          />
        ))}
      </div>
    </div>
  );
}

// Re-export components only (for Fast Refresh compatibility)
export { Participant } from './Participant';
export { ParticipantInfo } from './ParticipantInfo';
export { ParticipantAvatar, ParticipantMenu } from './ui';
