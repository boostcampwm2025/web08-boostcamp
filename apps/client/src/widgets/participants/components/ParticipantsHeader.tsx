import { ChevronDown } from 'lucide-react';

interface ParticipantsHeaderProps {
  totalCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function ParticipantsHeader({
  totalCount,
  isCollapsed,
  onToggleCollapse,
}: ParticipantsHeaderProps) {
  return (
    <div
      className="flex items-center justify-between -mx-4 px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors select-none"
      onClick={onToggleCollapse}
    >
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            isCollapsed ? '-rotate-90' : 'rotate-0'
          }`}
        />
        <h2 className="text-sm font-bold uppercase tracking-wide">
          Participants
        </h2>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
          {totalCount}
        </span>
      </div>
    </div>
  );
}
