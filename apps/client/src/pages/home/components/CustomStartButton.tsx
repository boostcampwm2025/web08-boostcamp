import { Settings2 } from 'lucide-react';
import {
  RadixPopover as Popover,
  RadixPopoverContent as PopoverContent,
  RadixPopoverTrigger as PopoverTrigger,
} from '@codejam/ui';
import { CustomStartPopover } from './CustomStartPopover';
import type { CreateCustomRoomRequest } from '@codejam/common';

interface CustomStartButtonProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: CreateCustomRoomRequest) => void;
  isLoading: boolean;
}

export function CustomStartButton({
  isOpen,
  onOpenChange,
  onCreate,
  isLoading,
}: CustomStartButtonProps) {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger
        disabled={isLoading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl font-mono text-lg font-medium whitespace-nowrap text-gray-500 transition-colors hover:text-blue-600 disabled:pointer-events-none disabled:opacity-50"
      >
        <Settings2 className="size-5" />
        Configuration
      </PopoverTrigger>

      <PopoverContent
        className="bg-background ring-accent w-80 overflow-hidden rounded-lg border-gray-100 p-0 shadow-2xl ring-2"
        align="center"
        sideOffset={12}
      >
        <CustomStartPopover onCreate={onCreate} isLoading={isLoading} />
      </PopoverContent>
    </Popover>
  );
}
