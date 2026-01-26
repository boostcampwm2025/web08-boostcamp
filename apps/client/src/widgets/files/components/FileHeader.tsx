import { ChevronDown } from 'lucide-react';
import { CapacityGauge } from '@/widgets/capacity-gauge';

interface FileHeaderProps {
  count: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function FileHeader({
  count,
  isCollapsed,
  onToggleCollapse,
}: FileHeaderProps) {
  return (
    <div
      className="-mx-4 flex cursor-pointer items-center justify-between px-4 py-3 transition-colors select-none hover:bg-gray-100 dark:hover:bg-gray-700/50"
      onClick={onToggleCollapse}
    >
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            isCollapsed ? '-rotate-90' : 'rotate-0'
          }`}
        />
        <h2 className="text-sm font-bold tracking-wide uppercase">Files</h2>
        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
          {count}
        </span>
      </div>

      <CapacityGauge />
    </div>
  );
}
