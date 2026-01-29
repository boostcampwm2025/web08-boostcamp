import { RadixProgress as Progress } from '@codejam/ui';
import { useFileStore } from '@/stores/file';

function formatBytes(bytes: number): string {
  if (bytes < 1000) return `${bytes} bytes`;
  if (bytes < 1_000_000) return `${(bytes / 1000).toFixed(1)} KB`;
  return `${(bytes / 1_000_000).toFixed(2)} MB`;
}

export function CapacityGauge() {
  const capacityPercentage = useFileStore((state) => state.capacityPercentage);
  const capacityBytes = useFileStore((state) => state.capacityBytes);
  const isOverLimit = useFileStore((state) => state.isOverLimit);

  const getIndicatorColor = () => {
    if (isOverLimit) return 'bg-red-500';
    if (capacityPercentage >= 70) return 'bg-orange-400';
    return 'bg-green-500';
  };

  const tooltipText = `${formatBytes(capacityBytes)} / 1 MB`;

  return (
    <div className="group relative flex items-center gap-2 font-sans">
      <div className="flex items-center gap-2">
        <Progress
          value={capacityPercentage}
          className="h-2 w-16 border border-gray-300 dark:border-gray-600"
          indicatorClassName={getIndicatorColor()}
        />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {capacityPercentage.toFixed(0)}%
        </span>
      </div>
      <div className="border-border bg-popover text-popover-foreground invisible absolute top-full left-1/2 z-[100] mt-2 -translate-x-1/2 rounded border px-2 py-1 text-[10px] font-medium whitespace-nowrap opacity-0 shadow-md transition-all group-hover:visible group-hover:opacity-100">
        {tooltipText}
        <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-t border-l border-inherit bg-inherit" />
      </div>
    </div>
  );
}
