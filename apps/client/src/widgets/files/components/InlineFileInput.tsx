import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { cn } from '@codejam/ui';

interface InlineFileInputProps {
  onSubmit: (filename: string) => void;
  onCancel: () => void;
}

export const InlineFileInput = ({ onSubmit, onCancel }: InlineFileInputProps) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit(value.trim());
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleBlur = () => {
    if (value.trim()) {
      onSubmit(value.trim());
    } else {
      onCancel();
    }
  };

  return (
    <div className="my-0.5 flex items-center p-2 px-3">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="example.txt"
        className={cn(
          'field-sizing-content bg-transparent text-sm outline-none',
          'border-b border-primary/50 text-foreground',
        )}
        autoFocus
      />
    </div>
  );
};
