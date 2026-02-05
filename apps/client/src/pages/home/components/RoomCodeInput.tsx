import { useRef } from 'react';
import type { KeyboardEvent, ClipboardEvent } from 'react';
import { LIMITS } from '@codejam/common';

export const ROOM_CODE_LENGTH = LIMITS.ROOM_CODE_LENGTH;

type ColorKey = 'blue' | 'green' | 'purple';

interface RoomCodeInputProps {
  value: string[];
  onChange: (code: string[]) => void;
  hasError?: boolean;
  onSubmit?: () => void;
  length?: number;
  colorKey?: ColorKey;
}

export function RoomCodeInput({
  value,
  onChange,
  hasError = false,
  onSubmit,
  length = ROOM_CODE_LENGTH,
  colorKey = 'green',
}: RoomCodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, inputValue: string) => {
    if (inputValue !== '' && !isValidRoomCodeChar(inputValue)) return;

    const newCode = [...value];
    newCode[index] = inputValue;
    onChange(newCode);

    // Move to next field after typing a character
    if (inputValue !== '' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    const inputValue = (e.target as HTMLInputElement).value;

    // Backspace handling
    // If current field is empty, move to previous field and clear it
    if (e.key === 'Backspace') {
      if (inputValue === '' && index > 0) {
        e.preventDefault();
        const newCode = [...value];
        newCode[index - 1] = '';
        onChange(newCode);
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }

    // Right arrow
    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }

    // Enter key to submit
    if (e.key === 'Enter') {
      const roomCode = value.join('');
      if (roomCode.length === length && onSubmit) {
        onSubmit();
      }
    }
  };

  // Paste handling
  const handlePaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData('text')
      .toUpperCase()
      .slice(0, length);

    // Filter only alphanumeric characters
    const validChars = pastedData
      .split('')
      .filter((char) => isValidRoomCodeChar(char));

    if (validChars.length === 0) return;

    const newCode = [...value];

    // Fill from current index
    validChars.forEach((char, i) => {
      const targetIndex = index + i;
      if (targetIndex < length) {
        newCode[targetIndex] = char;
      }
    });

    onChange(newCode);

    // Set new focus
    const nextIndex = Math.min(index + validChars.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const colorStyles = {
    blue: 'focus:border-brand-blue focus:ring-brand-blue/20 caret-brand-blue',
    green:
      'focus:border-brand-green focus:ring-brand-green/20 caret-brand-green',
    purple: 'focus:border-purple-500 focus:ring-purple-100 caret-purple-500',
  };

  const activeColorStyle = colorStyles[colorKey];

  return (
    <div
      className="grid w-full justify-center gap-[clamp(0.25rem,2vw,0.75rem)]"
      style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(2.5rem, 1fr))',
        maxWidth: '22rem',
      }}
    >
      {value.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(index, e)}
          className={`aspect-3/4 w-full rounded-xl border-2 text-center font-mono text-[clamp(1.25rem,4vw,2rem)] font-bold uppercase caret-transparent shadow-sm transition-all duration-200 ${
            hasError
              ? 'border-red-300 bg-red-50 text-red-600 caret-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
              : `border-gray-200 bg-white text-gray-800 focus:-translate-y-1 focus:ring-4 ${activeColorStyle}`
          } focus:outline-none`}
        />
      ))}
    </div>
  );
}

const isValidRoomCodeChar = (char: string): boolean => {
  return /^[a-zA-Z0-9]$/.test(char);
};
