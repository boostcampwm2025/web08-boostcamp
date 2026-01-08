import { useRef } from "react";
import type { KeyboardEvent, ClipboardEvent } from "react";

export const ROOM_CODE_LENGTH = 6;

interface RoomCodeInputProps {
  value: string[];
  onChange: (code: string[]) => void;
  hasError?: boolean;
  onSubmit?: () => void;
  length?: number;
}

export function RoomCodeInput({
  value,
  onChange,
  hasError = false,
  onSubmit,
  length = ROOM_CODE_LENGTH,
}: RoomCodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, inputValue: string) => {
    if (inputValue !== "" && !isValidRoomCodeChar(inputValue)) return;

    const newCode = [...value];
    newCode[index] = inputValue;
    onChange(newCode);

    // Move to next field after typing a character
    if (inputValue !== "" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    const inputValue = (e.target as HTMLInputElement).value;

    // Backspace handling
    // If current field is empty, move to previous field and clear it
    if (e.key === "Backspace") {
      if (inputValue === "" && index > 0) {
        e.preventDefault();
        const newCode = [...value];
        newCode[index - 1] = "";
        onChange(newCode);
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Left arrow
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }

    // Right arrow
    if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }

    // Enter key to submit
    if (e.key === "Enter") {
      const roomCode = value.join("");
      if (roomCode.length === length && onSubmit) {
        onSubmit();
      }
    }
  };

  // Paste handling
  const handlePaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text")
      .toUpperCase()
      .slice(0, length);

    // Filter only alphanumeric characters
    const validChars = pastedData
      .split("")
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

  return (
    <div className="flex gap-1 sm:gap-2 justify-center">
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
          className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-center text-base sm:text-xl md:text-2xl font-semibold font-mono border-2 ${
            hasError ? "border-red-500" : "border-gray-400"
          } focus:border-gray-900 focus:outline-none transition-colors uppercase caret-transparent`}
        />
      ))}
    </div>
  );
}

const isValidRoomCodeChar = (char: string): boolean => {
  return /^[a-zA-Z0-9]$/.test(char);
};
