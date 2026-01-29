import { RadixProgress as Progress, cn } from '@codejam/ui';
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
    if (isOverLimit) return 'bg-brand-red';
    if (capacityPercentage >= 70) return 'bg-brand-orange';
    return 'bg-brand-blue';
  };

  return (
    <div className="group flex flex-col gap-2 py-1 select-none">
      <div className="text-muted-foreground flex items-center justify-between text-[11px] font-medium">
        <div className="flex items-center gap-1">
          <span>저장 용량</span>
          <span
            className={cn(
              'font-semibold',
              isOverLimit ? 'text-brand-red' : 'text-brand-blue',
            )}
          >
            {capacityPercentage.toFixed(1)}%
          </span>
        </div>
        <span className="tabular-nums opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {formatBytes(capacityBytes)} / 1 MB
        </span>
      </div>

      <Progress
        value={capacityPercentage}
        className="bg-muted h-1.5 w-full overflow-hidden rounded-full border-none"
        indicatorClassName={cn(
          'transition-all duration-500',
          getIndicatorColor(),
        )}
      />
    </div>
  );
}
