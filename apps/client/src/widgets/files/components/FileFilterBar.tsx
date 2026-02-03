import { SortAsc, SortDesc, FileType, X } from 'lucide-react';
import { Button, cn } from '@codejam/ui';
import type { FileSortKey } from '../lib/types';

interface FileFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortKey: FileSortKey;
  onSortChange: (key: FileSortKey) => void;
}

export function FileFilterBar({
  searchQuery,
  onSearchChange,
  sortKey,
  onSortChange,
}: FileFilterBarProps) {
  const handleNameSortToggle = () => {
    if (sortKey === 'name-asc') {
      onSortChange('name-desc');
    } else {
      onSortChange('name-asc');
    }
  };

  const isNameSort = sortKey.startsWith('name');

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="파일 검색 ..."
          className="border-input focus-visible:ring-ring h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-none transition-colors outline-none focus-visible:ring-1"
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
          active={isNameSort}
          onClick={handleNameSortToggle}
          icon={
            sortKey === 'name-desc' ? (
              <SortDesc size={14} />
            ) : (
              <SortAsc size={14} />
            )
          }
          label="이름순"
        />
        <SortButton
          active={sortKey === 'ext'}
          onClick={() => onSortChange('ext')}
          icon={<FileType size={14} />}
          label="확장자"
        />
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
