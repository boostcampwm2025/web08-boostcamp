import { useMemo, useState } from 'react';
import {
  Combobox,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxChip,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@codejam/ui';
import {
  RadixSelect as Select,
  RadixSelectContent as SelectContent,
  RadixSelectItem as SelectItem,
  RadixSelectTrigger as SelectTrigger,
  RadixSelectValue as SelectValue,
} from '@codejam/ui';
import { RadixButton as Button } from '@codejam/ui';
import { X, Pencil, Eye } from 'lucide-react';
import type { FilterOption } from '../types';
import type { SortKey } from '../lib/types';
import { FILTER_OPTIONS, SORT_OPTIONS } from '../types';

interface ParticipantsFilterBarProps {
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
    <div className="space-y-2">
      <FilterCombobox
        selectedFilters={selectedFilters}
        onFiltersChange={onFiltersChange}
      />

      <div className="flex items-center gap-2">
        <SortSelect sortKey={sortKey} onSortChange={onSortChange} />
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

function FilterCombobox({
  selectedFilters,
  onFiltersChange,
}: {
  selectedFilters: FilterOption[];
  onFiltersChange: (filters: FilterOption[]) => void;
}) {
  const [inputValue, setInputValue] = useState('');
  const anchor = useComboboxAnchor();

  const filteredOptions = useMemo(() => {
    if (!inputValue) return FILTER_OPTIONS;
    return FILTER_OPTIONS.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase()),
    );
  }, [inputValue]);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Combobox
          items={filteredOptions}
          multiple
          value={selectedFilters}
          onValueChange={onFiltersChange}
          itemToStringValue={(item) => item.value}
        >
          <div className="relative" ref={anchor}>
            <ComboboxChips>
              <ComboboxValue>
                {selectedFilters.map((filter) => (
                  <ComboboxChip key={filter.value}>{filter.label}</ComboboxChip>
                ))}
              </ComboboxValue>
              <ComboboxChipsInput
                placeholder="필터 검색..."
                onChange={(e) => setInputValue(e.target.value)}
              />
            </ComboboxChips>
            {selectedFilters.length > 0 && (
              <button
                type="button"
                onClick={() => onFiltersChange([])}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Clear all filters"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <ComboboxContent anchor={anchor} className="min-w-(--anchor-width)">
            <ComboboxEmpty>필터를 찾을 수 없습니다.</ComboboxEmpty>
            <ComboboxList>
              {filteredOptions.map((item) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  );
}

function SortSelect({
  sortKey,
  onSortChange,
}: {
  sortKey: SortKey;
  onSortChange: (sortKey: SortKey) => void;
}) {
  return (
    <Select value={sortKey} onValueChange={onSortChange}>
      <SelectTrigger className="w-30">
        <SelectValue placeholder="정렬" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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
        className="ml-auto h-8 w-8"
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
