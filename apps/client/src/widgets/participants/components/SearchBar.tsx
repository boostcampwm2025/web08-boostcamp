import { useRef } from 'react';
import { X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
}

/**
 * 참가자 검색 입력 필드 컴포넌트
 * - 닉네임 또는 해시태그(#)로 검색 가능
 * - X 버튼으로 검색어 초기화
 */
export function SearchBar({
  searchQuery,
  onSearchChange,
  onClear,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onClear();
    inputRef.current?.focus();
  };

  return (
    <div className="relative border-b px-2 py-2">
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="이름 또는 태그(#) 검색..."
        className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 py-1 pr-9 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
        autoFocus
      />
      {/* Clear (X) Button */}
      {searchQuery && (
        <button
          onClick={handleClear}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute top-1/2 right-3 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-sm transition-colors outline-none focus-visible:ring-2"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
