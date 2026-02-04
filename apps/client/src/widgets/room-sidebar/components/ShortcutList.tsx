import { SidebarHeader, Button } from '@codejam/ui';
import { ArrowLeft } from 'lucide-react';
import { ShortcutListContent } from '@/widgets/global-shortcuts';

interface ShortcutListProps {
  onBack: () => void;
}

export function ShortcutList({ onBack }: ShortcutListProps) {
  return (
    <div className="flex h-full flex-col px-4 pb-4">
      <SidebarHeader
        title="단축키 안내"
        action={
          <Button variant="ghost" size="icon-xs" onClick={onBack}>
            <ArrowLeft className="size-4" />
          </Button>
        }
      />

      <div className="mt-4 flex-1 overflow-y-auto">
        <ShortcutListContent />
      </div>
    </div>
  );
}
