import { useState } from 'react';
import {
  RadixPopover as Popover,
  RadixPopoverContent as PopoverContent,
  RadixPopoverTrigger as PopoverTrigger,
  RadixButton as Button,
  cn,
} from '@codejam/ui';
import {
  X,
  Pencil,
  Eye,
  User,
  Clock,
  ListFilter,
  ChevronDown,
  Check,
} from 'lucide-react';
import type { FilterOption } from '../types';
import type { SortKey } from '../lib/types';
import { FILTER_OPTIONS } from '../types';

interface ParticipantsFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedFilters: FilterOption[];
  onFiltersChange: (filters: FilterOption[]) => void;
  sortKey: SortKey;
  onSortChange: (sortKey: SortKey) => void;
  filteredCount: number;
  onBulkEdit: () => void;
  onBulkView: () => void;
  isHost: boolean;
}

export function ParticipantsFilterBar({
  searchQuery,
  onSearchChange,
  selectedFilters,
  onFiltersChange,
  sortKey,
  onSortChange,
  filteredCount,
  onBulkEdit,
  onBulkView,
  isHost,
}: ParticipantsFilterBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="참가자 검색..."
          className="border-input focus-visible:ring-ring h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors outline-none focus-visible:ring-1"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1">
        <SortButton
          active={sortKey === 'name'}
          onClick={() => onSortChange('name')}
          icon={<User size={14} />}
          label="이름순"
        />

        <SortButton
          active={sortKey === 'time'}
          onClick={() => onSortChange('time')}
          icon={<Clock size={14} />}
          label="입장순"
        />

        <FilterButton
          selectedFilters={selectedFilters}
          onFiltersChange={onFiltersChange}
        />

        <div className="ml-auto flex items-center gap-2">
          <BulkActions
            isHost={isHost}
            filteredCount={filteredCount}
            onBulkEdit={onBulkEdit}
            onBulkView={onBulkView}
          />
        </div>
      </div>

      <FilterChips
        selectedFilters={selectedFilters}
        onFiltersChange={onFiltersChange}
      />
    </div>
  );
}

function SortButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        'h-7 gap-1.5 px-2 text-[11px] font-medium transition-colors duration-200',
        active
          ? 'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary'
          : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
      )}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}

function FilterButton({
  selectedFilters,
  onFiltersChange,
}: {
  selectedFilters: FilterOption[];
  onFiltersChange: (filters: FilterOption[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const handleToggle = (option: FilterOption) => {
    const isSelected = selectedFilters.some((f) => f.value === option.value);
    if (isSelected) {
      onFiltersChange(selectedFilters.filter((f) => f.value !== option.value));
    } else {
      onFiltersChange([...selectedFilters, option]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 gap-1.5 px-2 text-[11px] font-medium transition-colors duration-200',
            open || selectedFilters.length > 0
              ? 'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary'
              : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
          )}
        >
          <ListFilter size={14} />
          <span>필터</span>
          <ChevronDown size={12} className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-40 p-1">
        <div className="space-y-0.5">
          {FILTER_OPTIONS.map((option) => {
            const isSelected = selectedFilters.some(
              (f) => f.value === option.value,
            );
            return (
              <div
                key={option.value}
                onClick={() => handleToggle(option)}
                className={cn(
                  'hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-xs transition-colors outline-none select-none',
                  isSelected && 'bg-accent/50',
                )}
              >
                <div
                  className={cn(
                    'border-primary/30 flex size-3.5 items-center justify-center rounded-sm border',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'opacity-50',
                  )}
                >
                  {isSelected && <Check size={10} />}
                </div>
                <span>{option.label}</span>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FilterChips({
  selectedFilters,
  onFiltersChange,
}: {
  selectedFilters: FilterOption[];
  onFiltersChange: (filters: FilterOption[]) => void;
}) {
  if (selectedFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1">
      {selectedFilters.map((filter) => (
        <div
          key={filter.value}
          className="bg-muted text-muted-foreground flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
        >
          <span>{filter.label}</span>
          <button
            onClick={() =>
              onFiltersChange(
                selectedFilters.filter((f) => f.value !== filter.value),
              )
            }
            className="hover:bg-background hover:text-foreground rounded-full"
          >
            <X size={10} />
          </button>
        </div>
      ))}
      <button
        onClick={() => onFiltersChange([])}
        className="text-muted-foreground hover:text-foreground px-1 text-[10px] hover:underline"
      >
        초기화
      </button>
    </div>
  );
}

function BulkActions({
  isHost,
  filteredCount,
  onBulkEdit,
  onBulkView,
}: {
  isHost: boolean;
  filteredCount: number;
  onBulkEdit: () => void;
  onBulkView: () => void;
}) {
  if (!isHost || filteredCount === 0) return null;

  return (
    <>
      <Button
        size="icon"
        variant="outline"
        onClick={onBulkEdit}
        className="h-8 w-8"
        title="전체 편집 허용"
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        size="icon"
        variant="outline"
        onClick={onBulkView}
        className="h-8 w-8"
        title="전체 읽기 허용"
      >
        <Eye className="size-4" />
      </Button>
    </>
  );
}
