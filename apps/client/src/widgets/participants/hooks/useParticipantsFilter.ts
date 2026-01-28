import { useMemo } from 'react';
import { sortByTime, sortByNickname } from '../lib/sorter';
import { ROLE, type Pt } from '@codejam/common';
import type { SortState } from '../lib/types';

interface UseParticipantsFilterProps {
  pts: Record<string, Pt>;
  myPtId: string | undefined;
  searchQuery: string;
  sortState: SortState;
}

interface UseParticipantsFilterResult {
  me: Pt | undefined;
  others: Pt[];
  totalCount: number;
}

/**
 * 참가자 목록을 필터링하고 정렬하는 커스텀 훅
 */
export function useParticipantsFilter({
  pts,
  myPtId,
  searchQuery,
  sortState,
}: UseParticipantsFilterProps): UseParticipantsFilterResult {
  const myPt = useMemo(() => {
    return myPtId ? pts[myPtId] : undefined;
  }, [pts, myPtId]);

  return useMemo(() => {
    let allPts = Object.values(pts);
    const total = allPts.length;

    // 검색 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      allPts = allPts.filter((p) => {
        const matchNickname = p.nickname.toLowerCase().includes(query);

        const cleanQuery = query.startsWith('#') ? query.slice(1) : query;

        const matchHash =
          cleanQuery && p.ptHash
            ? p.ptHash.toString().toLowerCase().includes(cleanQuery)
            : false;

        return matchNickname || matchHash;
      });
    }

    const otherPts: Pt[] = allPts.filter((p) => p.ptId !== myPtId);

    // 나머지 정렬 로직
    otherPts.sort((a, b) => {
      // 호스트는 맨 위로
      if (a.role === ROLE.HOST) return -1;
      if (b.role === ROLE.HOST) return 1;

      if (sortState.key === 'time') {
        return sortByTime(a, b, sortState.order);
      }
      return sortByNickname(a, b, sortState.order);
    });

    return { me: myPt, others: otherPts, totalCount: total };
  }, [myPt, pts, searchQuery, sortState, myPtId]);
}
