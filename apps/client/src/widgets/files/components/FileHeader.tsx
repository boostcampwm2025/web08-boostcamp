import { CapacityGauge } from '@/widgets/capacity-gauge';

interface FileHeaderProps {
  count: number;
}

export function FileHeader({ count }: FileHeaderProps) {
  return (
    <div className="-mx-4 flex cursor-pointer items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
        <h2 className="text-sm font-bold tracking-wide uppercase">Files</h2>
        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
          {count}
        </span>
      </div>

      <CapacityGauge />
    </div>
  );
}
