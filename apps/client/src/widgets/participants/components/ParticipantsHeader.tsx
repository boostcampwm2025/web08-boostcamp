import React from 'react';
import { ChevronDown, Search, Clock, ArrowDownAZ } from 'lucide-react';
import type { SortMode } from '../lib/types';

interface ParticipantsHeaderProps {
  totalCount: number;
  isCollapsed: boolean;
  isSearchVisible: boolean;
  sortMode: SortMode;
  onToggleCollapse: () => void;
  onToggleSearch: (e: React.MouseEvent) => void;
  onToggleSortMode: (e: React.MouseEvent, mode: SortMode) => void;
}

export function ParticipantsHeader({
  totalCount,
  isCollapsed,
  isSearchVisible,
  sortMode,
  onToggleCollapse,
  onToggleSearch,
  onToggleSortMode,
}: ParticipantsHeaderProps) {
  return (
    <div
      className="flex items-center justify-between -mx-4 px-4 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
      onClick={onToggleCollapse}
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
      <div className="flex items-center gap-0.5">
        {/* Sort by Name */}
        <button
          onClick={(e) => onToggleSortMode(e, 'name')}
          className={`inline-flex items-center justify-center rounded-md transition-all outline-none size-8 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] ${
            sortMode === 'name'
              ? 'bg-accent text-accent-foreground dark:bg-accent/50'
              : 'text-gray-500 dark:text-gray-400'
          }`}
          title="Sort by Name (A-Z)"
        >
          <ArrowDownAZ size={16} strokeWidth={2} />
        </button>

        {/* Sort by Time */}
        <button
          onClick={(e) => onToggleSortMode(e, 'time')}
          className={`inline-flex items-center justify-center rounded-md transition-all outline-none size-8 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] ${
            sortMode === 'time'
              ? 'bg-accent text-accent-foreground dark:bg-accent/50'
              : 'text-gray-500 dark:text-gray-400'
          }`}
          title="Sort by Time Joined"
        >
          <Clock size={16} strokeWidth={2} />
        </button>

        {/* Search Button */}
        <button
          onClick={onToggleSearch}
          className={`inline-flex items-center justify-center rounded-md transition-all outline-none size-8 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] ${
            isSearchVisible
              ? 'bg-accent text-accent-foreground dark:bg-accent/50'
              : 'text-gray-500 dark:text-gray-400'
          }`}
          title="Search"
        >
          <Search size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
