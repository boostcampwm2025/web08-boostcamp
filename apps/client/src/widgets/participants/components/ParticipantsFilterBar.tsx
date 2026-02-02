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
import { RadixButton as Button, cn } from '@codejam/ui';
import { X, Pencil, Eye, User, Clock } from 'lucide-react';
import type { FilterOption } from '../types';
import type { SortKey } from '../lib/types';
import { FILTER_OPTIONS } from '../types';

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

        <div className="ml-auto flex items-center gap-2">
          <BulkActions
            isHost={isHost}
            filteredCount={filteredCount}
            onBulkEdit={onBulkEdit}
            onBulkView={onBulkView}
          />
        </div>
      </div>
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
