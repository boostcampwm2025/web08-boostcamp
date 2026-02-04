import { Slider as SliderPrimitive } from '@base-ui/react/slider';

import { cn } from '@/lib/utils';
import { useMemo } from 'react';

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  orientation = 'horizontal',
  ...props
}: SliderPrimitive.Root.Props) {
  const _values = useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  const isVertical = orientation === 'vertical';

  return (
    <SliderPrimitive.Root
      className={cn(isVertical ? 'h-full' : 'w-full', className)}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      orientation={orientation}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control
        className={cn(
          'relative flex touch-none select-none',
          isVertical
            ? 'h-full min-h-40 w-auto flex-col items-center'
            : 'w-full items-center',
        )}
      >
        <SliderPrimitive.Track
          className={cn(
            'bg-muted relative grow overflow-hidden rounded-full select-none',
            isVertical ? 'h-full w-1' : 'h-1 w-full',
          )}
        >
          <SliderPrimitive.Indicator
            className={cn(
              'bg-primary select-none',
              isVertical ? 'w-full' : 'h-full',
            )}
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className="border-ring ring-ring/50 relative block size-3 shrink-0 rounded-full border bg-white transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-[3px] focus-visible:ring-[3px] focus-visible:outline-hidden active:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
