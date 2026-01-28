import { ArrowDown, ArrowUp, CaseSensitive, Clock, Search } from 'lucide-react';
import type { SortKey, SortState } from '../lib/types';

interface ParticipantsToolbarProps {
  isSearchOpen: boolean;
  sortState: SortState;
  onToggleSearch: () => void;
  onChangeSort: (key: SortKey) => void;
}

/**
 * 참가자 목록의 도구 모음 컴포넌트
 * - 정렬 버튼 (이름/입장시간)
 * - 검색 기능 토글 버튼
 */
export function ParticipantsToolbar({
  isSearchOpen,
  sortState,
  onToggleSearch,
  onChangeSort,
}: ParticipantsToolbarProps) {
  /**
   * 정렬 버튼의 라벨과 화살표 표시 여부를 결정
   * - time: 활성화 시 "최신순"/"오래된순" 표시
   * - name: 활성화 시 화살표로 정렬 방향 표시
   */
  const getSortConfig = (
    key: SortKey,
    currentOrder: 'asc' | 'desc',
    isActive: boolean,
  ) => {
    if (key === 'time') {
      if (!isActive) return { label: '입장', showArrow: false };
      return {
        label: currentOrder === 'desc' ? '최신순' : '오래된순',
        showArrow: false,
      };
    }

    return {
      label: '이름',
      showArrow: isActive,
    };
  };

  const renderSortBtn = (
    key: SortKey,
    defaultLabel: string,
    Icon: React.ElementType,
  ) => {
    const isActive = sortState.key === key;
    const { label, showArrow } = getSortConfig(key, sortState.order, isActive);

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onChangeSort(key);
        }}
        className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
          isActive
            ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800'
            : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50'
        } `}
        title={
          isActive && key === 'name'
            ? sortState.order === 'asc'
              ? '오름차순 (A-Z)'
              : '내림차순 (Z-A)'
            : `${defaultLabel} 정렬`
        }
      >
        <Icon size={14} className={isActive ? 'opacity-100' : 'opacity-70'} />
        <span>{label}</span>
        {showArrow && (
          <span className="ml-0.5">
            {sortState.order === 'asc' ? (
              <ArrowUp size={12} strokeWidth={2.5} />
            ) : (
              <ArrowDown size={12} strokeWidth={2.5} />
            )}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="mb-1 flex items-center justify-between border-b border-gray-100 px-1 pb-2 dark:border-gray-700/50">
      {/* 정렬 그룹 */}
      <div className="flex items-center gap-1">
        {renderSortBtn('name', '이름', CaseSensitive)}
        {renderSortBtn('time', '입장', Clock)}
      </div>

      {/* 검색 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSearch();
        }}
        className={`rounded-md p-1.5 transition-colors ${
          isSearchOpen
            ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
        } `}
        title="검색 열기"
      >
        <Search size={16} />
      </button>
    </div>
  );
}
