import React, { useMemo, useRef, useState } from 'react';
import { Participant } from './Participant';
import { sorter } from './sorter';
import { usePt, usePtsStore } from '@/stores/pts';
import { useRoomStore } from '@/stores/room';
import type { Pt } from '@codejam/common';
import { ChevronDown, Search, X } from 'lucide-react';

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

  const inputRef = useRef<HTMLInputElement>(null);

  // 나/상대 분리 -> 정렬
  const { me, others, totalCount } = useMemo(() => {
    let allPts = Object.values(pts);
    const total = allPts.length;

    // 검색 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      allPts = allPts.filter((p) => p.nickname.toLowerCase().includes(query));
    }

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
  }, [pts, searchQuery, myPtId]);

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
    inputRef.current?.focus();
  };

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

        {/* Actions */}
        <div className="flex items-center">
          <button
            onClick={toggleSearch}
            className={
              'inline-flex items-center justify-center rounded-md transition-all outline-none' +
              'size-8 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50' +
              'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]' +
              isSearchVisible
                ? 'bg-accent text-accent-foreground dark:bg-accent/50'
                : 'text-gray-500 dark:text-gray-400'
            }
            title="Search"
          >
            <Search size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* --- Content --- */}
      <div
        className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-full opacity-100'}`}
      >
        {isSearchVisible && (
          <div className="px-2 py-2 bg-white dark:bg-gray-800 border-b dark:border-gray-700 relative">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색..."
              className="w-full h-9 rounded-md border border-input bg-transparent dark:bg-input/30 px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] pr-9"
              autoFocus
            />
            {/* Clear (X) Button */}
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center size-5 rounded-sm text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>
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
export { Participant } from './Participant';
export { ParticipantInfo } from './ParticipantInfo';
export { ParticipantAvatar, ParticipantMenu } from './ui';
