import { SortAsc, SortDesc, FileType } from 'lucide-react';
import { Button } from '@codejam/ui';
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
      variant={active ? 'secondary' : 'ghost'}
      size="xs"
      onClick={onClick}
      className={
        active ? 'bg-primary/10 text-primary ...' : 'text-muted-foreground ...'
      }
    >
      {icon}
      {label}
    </Button>
  );
}
