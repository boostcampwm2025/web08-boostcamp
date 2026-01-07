import { useState, useRef } from "react";
import type { KeyboardEvent, ClipboardEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";

const ROOM_CODE_LENGTH = 6;

interface JoinRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinRoomDialog({ open, onOpenChange }: JoinRoomDialogProps) {
  const [code, setCode] = useState<string[]>(Array(ROOM_CODE_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // Take the last character if multiple characters are present (happens when overwriting)
    const newChar = value.slice(-1);

    if (newChar !== "" && !isValidRoomCodeChar(newChar)) return;

    const newCode = [...code];
    newCode[index] = newChar;
    setCode(newCode);

    // Always move to next field after typing
    if (newChar !== "" && index < ROOM_CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value;

    // Backspace 처리
    // 현재 칸이 비어있으면 이전 칸으로 이동하고 값 지우기
    if (e.key === "Backspace") {
      if (value === "" && index > 0) {
        e.preventDefault();
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      }
    }

    // 왼쪽 화살표
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }

    // 오른쪽 화살표
    if (e.key === "ArrowRight" && index < ROOM_CODE_LENGTH - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }

    // Enter 키로 제출
    if (e.key === "Enter") {
      const roomCode = code.join("");
      if (roomCode.length === ROOM_CODE_LENGTH) {
        handleSubmit();
      }
    }
  };

  // 붙여넣기 처리
  const handlePaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text")
      .toUpperCase()
      .slice(0, ROOM_CODE_LENGTH);

    // 영문 + 숫자만 필터링
    const validChars = pastedData
      .split("")
      .filter((char) => isValidRoomCodeChar(char));

    if (validChars.length === 0) return;

    const newCode = [...code];

    // 현재 index부터 채우기
    validChars.forEach((char, i) => {
      const targetIndex = index + i;
      if (targetIndex < ROOM_CODE_LENGTH) {
        newCode[targetIndex] = char;
      }
    });

    setCode(newCode);

    // 마지막으로 채워진 칸 다음으로 포커스
    const lastFilledIndex = Math.min(
      index + validChars.length,
      ROOM_CODE_LENGTH - 1
    );
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleSubmit = () => {
    const roomCode = code.join("");
    if (roomCode.length === ROOM_CODE_LENGTH) {
      console.log("Room code:", roomCode);
      // Add your room join logic here
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center justify-center">
        <DialogHeader className="text-center sm:text-center items-center">
          <DialogTitle>코드 입력</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex gap-2 justify-center">
            {code.map((digit, index) => (
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
                className="w-12 h-12 text-center text-2xl font-semibold font-mono border-2 border-gray-300 focus:border-gray-700 focus:outline-none transition-colors uppercase caret-transparent"
              />
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={code.some((digit) => digit === "")}
            className="text-gray-800 transition-all"
          >
            입장하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const isValidRoomCodeChar = (char: string): boolean => {
  return /^[a-zA-Z0-9]$/.test(char);
};
