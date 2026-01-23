import * as React from 'react';
import { Combobox as BaseCombobox } from '@base-ui/react';
import { X } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

// Root Combobox
const Combobox = BaseCombobox.Root;

// Combobox Input
const ComboboxInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof BaseCombobox.Input>
>(({ className, ...props }, ref) => {
  return (
    <BaseCombobox.Input
      ref={ref}
      className={cn(
        'border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*="text-"])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
});
ComboboxInput.displayName = 'ComboboxInput';

// Combobox Content (Portal + Positioner + Popup)
const ComboboxContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof BaseCombobox.Popup>
>(({ className, children, ...props }, ref) => {
  return (
    <BaseCombobox.Portal>
      <BaseCombobox.Positioner sideOffset={4}>
        <BaseCombobox.Popup
          ref={ref}
          className={cn(
            'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-[300px] w-full min-w-[var(--anchor-width)] overflow-y-auto rounded-md border shadow-md p-1 bg-white dark:bg-gray-800',
            className,
          )}
          {...props}
        >
          {children}
        </BaseCombobox.Popup>
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  );
});
ComboboxContent.displayName = 'ComboboxContent';

// Combobox List
const ComboboxList = BaseCombobox.List;

// Combobox Item (using BaseCombobox.Item instead of Option)
const ComboboxItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof BaseCombobox.Item>
>(({ className, children, ...props }, ref) => {
  return (
    <BaseCombobox.Item
      ref={ref}
      className={cn(
        'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </BaseCombobox.Item>
  );
});
ComboboxItem.displayName = 'ComboboxItem';

// Combobox Empty
const ComboboxEmpty = BaseCombobox.Empty;

// Combobox Chips (using BaseCombobox.Chips)
const ComboboxChips = BaseCombobox.Chips;

// Combobox Value (using BaseCombobox.Value)
const ComboboxValue = BaseCombobox.Value;

// Combobox Chip (using BaseCombobox.Chip)
const ComboboxChip = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof BaseCombobox.Chip> & {
    onRemove?: () => void;
  }
>(({ className, children, onRemove, ...props }, ref) => {
  return (
    <BaseCombobox.Chip
      ref={ref}
      className={cn(
        'bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
        className,
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <BaseCombobox.ChipRemove
          onClick={onRemove}
          className="hover:bg-secondary-foreground/20 ml-1 rounded-sm transition-colors"
        >
          <X className="size-3" />
        </BaseCombobox.ChipRemove>
      )}
    </BaseCombobox.Chip>
  );
});
ComboboxChip.displayName = 'ComboboxChip';

// Combobox Chips Input
const ComboboxChipsInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof BaseCombobox.Input>
>(({ className, ...props }, ref) => {
  return (
    <BaseCombobox.Input
      ref={ref}
      className={cn(
        'placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
});
ComboboxChipsInput.displayName = 'ComboboxChipsInput';

// Combobox Group
const ComboboxGroup = BaseCombobox.Group;

// Combobox Separator
const ComboboxSeparator = BaseCombobox.Separator;

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxChips,
  ComboboxValue,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxGroup,
  ComboboxSeparator,
};
