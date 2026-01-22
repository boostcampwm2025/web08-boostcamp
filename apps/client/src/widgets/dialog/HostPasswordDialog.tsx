import { useState } from 'react';
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

interface HostPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password: string) => void;
}

/**
 * 호스트 비밀번호 입력 다이얼로그
 * - 호스트 권한 요청 시 사용
 */
export function HostPasswordDialog({
  open,
  onOpenChange,
  onConfirm,
}: HostPasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    const input = password.trim();
    if (!input) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    onConfirm(input);
    handleClose();
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
        else onOpenChange(isOpen);
      }}
    >
      <DialogContent showCloseButton={false}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>호스트 비밀번호 입력</DialogTitle>
            <DialogDescription>
              호스트 권한을 요청하려면 비밀번호를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="host-password">비밀번호</Label>
              <Input
                id="host-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="호스트 비밀번호를 입력해주세요."
                autoFocus
                maxLength={16}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleClose}>
              취소
            </Button>
            <Button type="submit" disabled={!password.trim()}>
              요청
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
