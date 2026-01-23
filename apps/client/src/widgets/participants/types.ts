import type { Pt } from '@codejam/common';
import type { SortKey } from './lib/types';

// 필터 옵션 타입
export type FilterType = 'role' | 'presence';

export type FilterOption = {
  label: string;
  value: string;
  type: FilterType;
};

// 정렬 옵션 타입 (기존 SortKey 'name' | 'time' 사용)
export type SortOption = {
  label: string;
  value: SortKey;
};

// 필터 옵션 목록
export const FILTER_OPTIONS: FilterOption[] = [
  { label: 'Online', value: 'online', type: 'presence' },
  { label: 'Offline', value: 'offline', type: 'presence' },
  { label: 'Host', value: 'host', type: 'role' },
  { label: 'Editor', value: 'editor', type: 'role' },
  { label: 'Viewer', value: 'viewer', type: 'role' },
];

// 정렬 옵션 목록 (기존 정렬 키 사용)
export const SORT_OPTIONS: SortOption[] = [
  { label: '입장순', value: 'time' },
  { label: '이름순', value: 'name' },
];

// 필터 함수 (AND 로직)
export function filterParticipants(
  pts: Record<string, Pt>,
  filters: FilterOption[],
): Pt[] {
  const ptList = Object.values(pts);

  if (filters.length === 0) {
    return ptList;
  }

  return ptList.filter((pt) => {
    // 모든 필터 조건을 만족해야 함 (AND 로직)
    return filters.every((filter) => {
      if (filter.type === 'role') {
        return pt.role === filter.value;
      }
      if (filter.type === 'presence') {
        return pt.presence === filter.value;
      }
      return false;
    });
  });
}

// 정렬 함수 (기존 useParticipantsFilter에서 사용하는 키와 통일)
export function sortParticipants(pts: Pt[], sortKey: SortKey): Pt[] {
  const sorted = [...pts];

  switch (sortKey) {
    case 'time':
      return sorted.sort((a, b) => {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

    case 'name':
      return sorted.sort((a, b) => {
        return a.nickname.localeCompare(b.nickname);
      });

    default:
      return sorted;
  }
}
