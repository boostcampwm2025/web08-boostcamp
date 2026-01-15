import { useRef } from 'react';
import { X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
}

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
    <div className="px-2 py-2 bg-white dark:bg-gray-800 border-b dark:border-gray-700 relative">
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="이름 또는 태그(#) 검색..."
        className="w-full h-9 rounded-md border border-input bg-transparent dark:bg-input/30 px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] pr-9"
        autoFocus
      />
      {/* Clear (X) Button */}
      {searchQuery && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center size-5 rounded-sm text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
