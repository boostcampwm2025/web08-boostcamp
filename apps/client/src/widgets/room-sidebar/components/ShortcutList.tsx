import { SidebarHeader, Button } from '@codejam/ui';
import { ArrowLeft } from 'lucide-react';
import { ShortcutListContent } from '@/widgets/global-shortcuts';

interface ShortcutListProps {
  onBack: () => void;
}

export function ShortcutList({ onBack }: ShortcutListProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <SidebarHeader
        title="단축키 안내"
        action={
          <Button
            variant="ghost"
            size="xs"
            onClick={onBack}
            className="h-5 w-5"
          >
            <ArrowLeft />
          </Button>
        }
      />

      <div className="mt-4 flex-1 overflow-y-auto">
        <ShortcutListContent />
      </div>
    </div>
  );
}
