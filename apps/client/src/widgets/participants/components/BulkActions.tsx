import { Button } from '@codejam/ui';
import { Pencil, Eye } from 'lucide-react';

interface BulkActionsProps {
  isHost: boolean;
  filteredCount: number;
  onBulkEdit: () => void;
  onBulkView: () => void;
}

export function BulkActions({
  isHost,
  filteredCount,
  onBulkEdit,
  onBulkView,
}: BulkActionsProps) {
  if (!isHost || filteredCount === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon-xs"
        onClick={onBulkEdit}
        className="text-muted-foreground hover:text-foreground transition-colors duration-200"
        title="전체 편집 허용"
      >
        <Pencil />
      </Button>
      <Button
        variant="outline"
        size="icon-xs"
        onClick={onBulkView}
        className="text-muted-foreground hover:text-foreground transition-colors duration-200"
        title="전체 읽기 허용"
      >
        <Eye />
      </Button>
    </div>
  );
}
