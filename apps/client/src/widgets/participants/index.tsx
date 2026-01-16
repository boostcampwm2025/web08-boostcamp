import { useState } from 'react';
import {
  Participant,
  ParticipantsHeader,
  ParticipantsToolbar,
  SearchBar,
} from './components';
import { useParticipantsFilter } from './hooks';
import { usePt, usePtsStore } from '@/stores/pts';
import { useRoomStore } from '@/stores/room';
import type { SortKey, SortState } from './lib/types';

/**
 * 참가자 목록 위젯 메인 컴포넌트
 * - 실시간 참가자 목록 표시
 * - 검색, 정렬, 필터링 기능 제공
 * - 호스트의 경우 참가자 역할 관리 가능
 */
export function Participants() {
  const pts = usePtsStore((state) => state.pts);
  const myPtId = useRoomStore((state) => state.myPtId);

  // 내 정보와 권한 확인
  const meData = usePt(myPtId);
  const iAmHost = meData?.role === 'host';

  // 상태 관리
  const [isCollapsed, setIsCollapsed] = useState(false); // 리스트 접기/펼치기
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 정렬 상태 관리 (기본값: 입장시간 내림차순 - 최신순)
  const [sortState, setSortState] = useState<SortState>({
    key: 'time',
    order: 'asc',
  });

  // 참가자 필터링 및 정렬
  const { me, others, totalCount } = useParticipantsFilter({
    pts,
    myPtId: myPtId ?? undefined,
    searchQuery,
    sortState,
  });

  // 검색창 토글
  const toggleSearch = () => {
    setIsSearchVisible((prev) => {
      const next = !prev;
      if (!next) setSearchQuery('');
      return next;
    });
  };

  // 검색어 초기화 (X 버튼)
  const clearSearch = () => {
    setSearchQuery('');
  };

  // 정렬 핸들러
  // 같은 키를 누르면 순서 반전, 다른 키면 해당 키의 asc로 시작
  const handleSortChange = (key: SortKey) => {
    setSortState((prev) => {
      if (prev.key === key) {
        return {
          key,
          order: prev.order === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, order: 'asc' };
    });
  };

  return (
    <div className="w-full px-4">
      <ParticipantsHeader
        totalCount={totalCount}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* --- Content --- */}
      <div
        className={`flex flex-col overflow-hidden transition-all duration-200 ease-in-out ${isCollapsed ? 'max-h-0' : 'max-h-[600px]'}`}
      >
        {/* 상단 툴바 (정렬 & 검색 버튼) */}
        <div className="mt-2 mb-1">
          <ParticipantsToolbar
            isSearchOpen={isSearchVisible}
            sortState={sortState}
            onToggleSearch={toggleSearch}
            onChangeSort={handleSortChange}
          />
        </div>

        {isSearchVisible && (
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClear={clearSearch}
          />
        )}

        <div className="flex-1 overflow-y-auto min-h-0 max-h-[30vh]">
          {me && <Participant ptId={me.ptId} hasPermission={false} />}

          {me && others.length > 0 && (
            <div className="mx-3 my-1 border-t border-gray-300 dark:border-gray-600 opacity-50" />
          )}

          {others.map((p) => (
            <Participant key={p.ptId} ptId={p.ptId} hasPermission={iAmHost} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Re-export components only (for Fast Refresh compatibility)
export { Participant } from './components/Participant';
export { ParticipantInfo } from './components/ParticipantInfo';
export { ParticipantAvatar, ParticipantMenu } from './ui';
