import { useMemo, useState } from 'react';
import {
  cn,
  RadixButton as Button,
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
} from '@codejam/ui';
import { Pencil, Eye, User, Clock, X, RotateCcw } from 'lucide-react';
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
      <SearchFilterCombobox
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        selectedFilters={selectedFilters}
        onFiltersChange={onFiltersChange}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <SortButton
            active={sortKey === 'time'}
            onClick={() => onSortChange('time')}
            icon={<Clock size={14} />}
            label="입장순"
          />

          <SortButton
            active={sortKey === 'name'}
            onClick={() => onSortChange('name')}
            icon={<User size={14} />}
            label="이름순"
          />
        </div>

        <BulkActions
          isHost={isHost}
          filteredCount={filteredCount}
          onBulkEdit={onBulkEdit}
          onBulkView={onBulkView}
        />
      </div>
    </div>
  );
}

function SearchFilterCombobox({
  searchQuery,
  onSearchChange,
  selectedFilters,
  onFiltersChange,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedFilters: FilterOption[];
  onFiltersChange: (filters: FilterOption[]) => void;
}) {
  const [open, setOpen] = useState(false);

  // Filter options based on search query
  const matchedOptions = useMemo(() => {
    if (!searchQuery) return FILTER_OPTIONS;
    const query = searchQuery.toLowerCase();
    return FILTER_OPTIONS.filter((option) =>
      option.label.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  // Group options by type dynamically
  const groupedOptions = useMemo(() => {
    return matchedOptions.reduce(
      (groups, option) => {
        const type = option.type;
        if (!groups[type]) groups[type] = [];
        groups[type].push(option);
        return groups;
      },
      {} as Record<string, FilterOption[]>,
    );
  }, [matchedOptions]);

  // Get selected filter values for Combobox
  const selectedValues = selectedFilters.map((f) => f.value);

  const handleValueAdded = (value: string) => {
    const newFilter = FILTER_OPTIONS.find((opt) => opt.value === value);
    if (!newFilter) return;

    // Remove any existing filter of the same type
    // Mutually exclusive within group
    const otherFilters = selectedFilters.filter(
      (f) => f.type !== newFilter.type,
    );
    onFiltersChange([...otherFilters, newFilter]);

    // Close dropdown after selection
    setOpen(false);

    // Clear search after closing dropdown to prevent flash
    onSearchChange('');
  };

  const handleValueRemoved = (value: string) => {
    onFiltersChange(selectedFilters.filter((f) => f.value !== value));

    // Close dropdown after removal
    setOpen(false);
  };

  const handleValueChange = (newValues: string[]) => {
    // Check if a value was added
    const added = newValues.find((v) => !selectedValues.includes(v));
    if (added) handleValueAdded(added);

    // Check if a value was removed
    const removed = selectedValues.find((v) => !newValues.includes(v));
    if (removed) handleValueRemoved(removed);
  };

  const handleRemoveFilter = (filterValue: string) => {
    handleValueRemoved(filterValue);
  };

  return (
    <div className="flex flex-col gap-2">
      <Combobox
        value={selectedValues}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={setOpen}
        autoHighlight
        multiple
      >
        <ComboboxInput
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="참가자 검색 ..."
          className="border-input focus-visible:ring-ring h-9 w-full rounded-md border bg-transparent py-1 text-sm shadow-none transition-colors outline-none focus-visible:ring-1"
        />

        <FilterOptions
          groupedOptions={groupedOptions}
          matchedOptions={matchedOptions}
          selectedValues={selectedValues}
        />
      </Combobox>

      <CustomChips
        filters={selectedFilters}
        onRemove={handleRemoveFilter}
        onClearAll={() => onFiltersChange([])}
      />
    </div>
  );
}

function FilterOptions({
  groupedOptions,
  matchedOptions,
  selectedValues,
}: {
  groupedOptions: Record<string, FilterOption[]>;
  matchedOptions: FilterOption[];
  selectedValues: string[];
}) {
  if (matchedOptions.length === 0) return null;

  return (
    <ComboboxContent>
      <ComboboxList>
        {Object.entries(groupedOptions).map(([type, options]) => (
          <ComboboxGroup key={type}>
            <ComboboxLabel>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </ComboboxLabel>
            {options.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <ComboboxItem
                  key={option.value}
                  value={option.value}
                  className={cn(
                    'data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex cursor-pointer items-center rounded-sm px-3 py-2 text-sm transition-colors outline-none select-none',
                    isSelected && 'bg-accent/50',
                  )}
                >
                  {option.label}
                </ComboboxItem>
              );
            })}
          </ComboboxGroup>
        ))}
      </ComboboxList>
    </ComboboxContent>
  );
}

function CustomChips({
  filters,
  onRemove,
  onClearAll,
}: {
  filters: FilterOption[];
  onRemove: (value: string) => void;
  onClearAll: () => void;
}) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {filters.map((filter) => (
        <CustomChip
          key={filter.value}
          label={filter.label}
          onRemove={() => onRemove(filter.value)}
        />
      ))}
      <button
        onClick={onClearAll}
        className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-1 transition-colors"
        type="button"
        title="Clear all filters"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
}

function CustomChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <div className="bg-muted text-foreground flex h-[21px] w-fit items-center justify-center gap-1 rounded-sm px-1.5 text-xs font-medium whitespace-nowrap">
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:bg-background hover:text-foreground -mr-1 ml-0.5 rounded-full p-0.5 opacity-50 transition-opacity hover:opacity-100"
        type="button"
      >
        <X size={10} />
      </button>
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
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={onBulkEdit}
        className="text-muted-foreground hover:text-foreground p-0 text-sm font-medium transition-colors duration-200"
        title="전체 또는 선택된 참가자에 대해 편집 허용"
      >
        <Pencil size={14} />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={onBulkView}
        className="text-muted-foreground hover:text-foreground p-0 text-sm font-medium transition-colors duration-200"
        title="전체 또는 선택된 참가자에 대해 읽기 허용"
      >
        <Eye size={14} />
      </Button>
    </div>
  );
}
