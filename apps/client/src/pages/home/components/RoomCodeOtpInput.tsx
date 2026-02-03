import { useEffect, useRef, type KeyboardEvent } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@codejam/ui';
import { LIMITS } from '@codejam/common';

interface RoomCodeOtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  invalid?: boolean;
  errorKey?: number;
}

export function RoomCodeOtpInput({
  value,
  onChange,
  onSubmit,
  disabled,
  invalid,
  errorKey,
}: RoomCodeOtpInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (errorKey !== undefined && errorKey > 0) {
      inputRef.current?.focus();
    }
  }, [errorKey]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === 'Enter' &&
      value.length === LIMITS.ROOM_CODE_LENGTH &&
      onSubmit
    ) {
      onSubmit();
    }
  };

  return (
    <InputOTP
      ref={inputRef}
      maxLength={LIMITS.ROOM_CODE_LENGTH}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      disabled={disabled}
    >
      <InputOTPGroup key={errorKey} className={invalid ? 'animate-shake' : ''}>
        <InputOTPSlot
          index={0}
          className="size-14 font-mono text-2xl font-bold"
          aria-invalid={invalid}
        />
        <InputOTPSlot
          index={1}
          className="size-14 font-mono text-2xl font-bold"
          aria-invalid={invalid}
        />
        <InputOTPSlot
          index={2}
          className="size-14 font-mono text-2xl font-bold"
          aria-invalid={invalid}
        />
        <InputOTPSlot
          index={3}
          className="size-14 font-mono text-2xl font-bold"
          aria-invalid={invalid}
        />
        <InputOTPSlot
          index={4}
          className="size-14 font-mono text-2xl font-bold"
          aria-invalid={invalid}
        />
        <InputOTPSlot
          index={5}
          className="size-14 font-mono text-2xl font-bold"
          aria-invalid={invalid}
        />
      </InputOTPGroup>
    </InputOTP>
  );
}
