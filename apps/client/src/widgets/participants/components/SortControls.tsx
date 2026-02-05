import { Button } from '@codejam/ui';
import { User, Clock } from 'lucide-react';
import type { SortKey } from '../lib/types';

interface SortControlsProps {
  sortKey: SortKey;
  onSortChange: (sortKey: SortKey) => void;
}

export function SortControls({ sortKey, onSortChange }: SortControlsProps) {
  return (
    <div className="flex items-center gap-1">
      <SortButton
        active={sortKey === 'time'}
        onClick={() => onSortChange('time')}
        icon={<Clock />}
        label="입장순"
      />

      <SortButton
        active={sortKey === 'name'}
        onClick={() => onSortChange('name')}
        icon={<User />}
        label="이름순"
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
