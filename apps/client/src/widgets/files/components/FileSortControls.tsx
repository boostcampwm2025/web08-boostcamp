import { SortAsc, SortDesc, FileType } from 'lucide-react';
import { Button, cn } from '@codejam/ui';
import type { FileSortKey } from '../lib/types';

interface FileSortControlsProps {
  sortKey: FileSortKey;
  onSortChange: (key: FileSortKey) => void;
}

export function FileSortControls({
  sortKey,
  onSortChange,
}: FileSortControlsProps) {
  const handleNameSortToggle = () => {
    if (sortKey === 'name-asc') {
      onSortChange('name-desc');
    } else {
      onSortChange('name-asc');
    }
  };

  const isNameSort = sortKey.startsWith('name');

  return (
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
