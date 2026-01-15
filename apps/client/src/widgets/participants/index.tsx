import React, { useState } from 'react';
import { Participant } from './components/Participant';
import { ParticipantsHeader } from './components/ParticipantsHeader';
import { SearchBar } from './components/SearchBar';
import { useParticipantsFilter } from './hooks/useParticipantsFilter';
import { usePt, usePtsStore } from '@/stores/pts';
import { useRoomStore } from '@/stores/room';
import type { SortMode } from './lib/types';

export function Participants() {
  const pts = usePtsStore((state) => state.pts);
  const myPtId = useRoomStore((state) => state.myPtId);

  // 내 정보와 권한 확인
  const meData = usePt(myPtId);
  const iAmHost = meData?.role === 'host';

  // UI 상태 관리
  const [isCollapsed, setIsCollapsed] = useState(false); // 리스트 접기/펼치기
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Data 상태 관리
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('time');

  // 참가자 필터링 및 정렬
  const { me, others, totalCount } = useParticipantsFilter({
    pts,
    myPtId: myPtId ?? undefined,
    searchQuery,
    sortMode,
  });

  // 검색창 토글
  const toggleSearch = (e: React.MouseEvent) => {
    e.stopPropagation();

    setIsCollapsed((collapsed) => {
      if (collapsed) return false;
      return collapsed;
    });

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

  // 정렬 모드 변경
  const toggleSortMode = (e: React.MouseEvent, mode: SortMode) => {
    e.stopPropagation();
    setSortMode(mode);
  };

  return (
    <div className="w-full min-w-3xs bg-white dark:bg-gray-800 p-4 font-sans">
      <ParticipantsHeader
        totalCount={totalCount}
        isCollapsed={isCollapsed}
        isSearchVisible={isSearchVisible}
        sortMode={sortMode}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        onToggleSearch={toggleSearch}
        onToggleSortMode={toggleSortMode}
      />

      {/* --- Content --- */}
      <div
        className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-full opacity-100'}`}
      >
        {isSearchVisible && (
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClear={clearSearch}
          />
        )}

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
export { Participant } from './components/Participant';
export { ParticipantInfo } from './components/ParticipantInfo';
export { ParticipantAvatar, ParticipantMenu } from './ui';
