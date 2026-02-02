import { useState } from 'react';
import { passwordSchema } from '@codejam/common';
import {
  RadixDialog as Dialog,
  RadixDialogContent as DialogContent,
  RadixDialogDescription as DialogDescription,
  RadixDialogFooter as DialogFooter,
  RadixDialogHeader as DialogHeader,
  RadixDialogTitle as DialogTitle,
} from '@codejam/ui';
import { RadixButton as Button } from '@codejam/ui';
import { RadixInput as Input } from '@codejam/ui';
import { RadixLabel as Label } from '@codejam/ui';

interface PasswordDialogProps {
  open: boolean;
  passwordError?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password: string) => void;
}

export function PasswordDialogProps({
  open,
  passwordError,
  onOpenChange,
  onConfirm,
}: PasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    const input = password.trim();

    // Zod 검증
    const result = passwordSchema.safeParse(input);

    if (!result.success) {
      const firstError = result.error.issues[0];
      setError(firstError?.message || '비밀번호를 확인해주세요.');
      return;
    }

    setError('');
    onConfirm(result.data);
    setPassword('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 최대 16자로 제한
    if (value.length <= 16) {
      setPassword(value);
      setError(''); // 입력 중에는 에러 메시지 제거
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>비밀번호 입력</DialogTitle>
            <DialogDescription>
              방에 입장하기 위한 비밀번호를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={handleChange}
                placeholder="비밀번호를 입력해주세요."
                autoFocus
                aria-invalid={!!error}
                maxLength={16}
              />
              {error && (
                <p className="text-destructive text-sm text-red-600">{error}</p>
              )}
              {passwordError && (
                <p className="text-destructive text-sm text-red-600">
                  {passwordError}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!password.trim()}>
              입력
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
