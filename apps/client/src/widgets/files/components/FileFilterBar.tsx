import { Search, X } from 'lucide-react';
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from '@codejam/ui';

interface FileFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortControls: React.ReactNode;
}

export function FileFilterBar({
  searchQuery,
  onSearchChange,
  sortControls,
}: FileFilterBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="mt-1">
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <Search className="text-muted-foreground size-4" />
          </InputGroupAddon>
          <InputGroupInput
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="파일 검색 ..."
            className="h-9 text-sm"
          />
          {searchQuery && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                onClick={() => onSearchChange('')}
                title="검색어 지우기"
              >
                <X />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>

      <div className="flex items-center justify-between">{sortControls}</div>
    </div>
  );
}
