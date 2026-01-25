import { useState } from 'react';
import { nicknameSchema } from '@codejam/common';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

interface NicknameInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (nickname: string) => void;
}

export function NicknameInputDialog({
  open,
  onOpenChange,
  onConfirm,
}: NicknameInputDialogProps) {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    const trimmedNickname = nickname.trim();

    // Zod 검증
    const result = nicknameSchema.safeParse(trimmedNickname);

    if (!result.success) {
      const firstError = result.error.issues[0];
      setError(firstError?.message || '닉네임을 확인해주세요.');
      return;
    }

    setError('');
    onConfirm(result.data);
    setNickname('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 최대 6자로 제한
    if (value.length <= 6) {
      setNickname(value);
      setError(''); // 입력 중에는 에러 메시지 제거
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>닉네임 입력</DialogTitle>
            <DialogDescription>
              방에 입장하기 위한 닉네임을 입력해주세요. (1-6자)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={handleChange}
                placeholder="닉네임을 입력하세요"
                autoFocus
                aria-invalid={!!error}
                maxLength={6}
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!nickname.trim()}>
              입장하기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
