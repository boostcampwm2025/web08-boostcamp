import { Progress } from '@/shared/ui/progress';
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
    <div className="relative flex items-center gap-2 group font-sans">
      <div className="flex items-center gap-2">
        <Progress
          value={capacityPercentage}
          className="w-16 h-2 border border-gray-300 dark:border-gray-600"
          indicatorClassName={getIndicatorColor()}
        />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {capacityPercentage.toFixed(0)}%
        </span>
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-primary-foreground bg-white dark:bg-gray-800 border-[0.5px] border-gray-300 dark:border-gray-600 rounded shadow-lg whitespace-nowrap z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
        {tooltipText}
      </div>
    </div>
  );
}
