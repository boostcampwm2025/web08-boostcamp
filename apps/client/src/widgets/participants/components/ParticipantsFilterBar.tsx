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
} from '@/shared/ui/combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import { Check, X, Pencil, Eye } from 'lucide-react';
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
  const [inputValue, setInputValue] = useState('');

  // 필터 옵션을 검색어로 필터링
  const filteredOptions = useMemo(() => {
    if (!inputValue) return FILTER_OPTIONS;
    return FILTER_OPTIONS.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase()),
    );
  }, [inputValue]);

  // 필터 추가/제거 처리
  const handleValueChange = (values: FilterOption[]) => {
    onFiltersChange(values);
  };

  // 개별 필터 제거
  const handleRemoveFilter = (value: string) => {
    const newFilters = selectedFilters.filter((f) => f.value !== value);
    onFiltersChange(newFilters);
  };

  return (
    <div className="space-y-2">
      {/* 필터 Combobox */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Combobox
            items={filteredOptions}
            multiple
            value={selectedFilters}
            onValueChange={handleValueChange}
            itemToStringValue={(item) => item.value}
          >
            <div className="relative">
              <ComboboxChips>
                <ComboboxValue>
                  {selectedFilters.map((filter) => (
                    <ComboboxChip
                      key={filter.value}
                      onRemove={() => handleRemoveFilter(filter.value)}
                    >
                      {filter.label}
                    </ComboboxChip>
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
            <ComboboxContent>
              <ComboboxEmpty>필터를 찾을 수 없습니다.</ComboboxEmpty>
              <ComboboxList>
                {(item) => {
                  const isSelected = selectedFilters.some(
                    (f) => f.value === item.value,
                  );
                  return (
                    <ComboboxItem key={item.value} value={item}>
                      <div className="flex w-full items-center justify-between">
                        <span>{item.label}</span>
                        {isSelected && <Check className="size-4" />}
                      </div>
                    </ComboboxItem>
                  );
                }}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>

      {/* 정렬 & 일괄 권한 변경 */}
      <div className="flex items-center gap-2">
        {/* 정렬 Select */}
        <Select value={sortKey} onValueChange={onSortChange}>
          <SelectTrigger className="w-[120px]">
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

        {/* 일괄 권한 변경 버튼 */}
        {isHost && filteredCount > 0 && (
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
        )}
      </div>
    </div>
  );
}
