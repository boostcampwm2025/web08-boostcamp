import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  Label,
} from '@codejam/ui';
import { passwordSchema } from '@codejam/common';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

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
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (error || !password) return;

    onConfirm(password);
    handleClose();
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    setShowPassword(false);
    onOpenChange(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setPassword(input);

    if (!input.trim()) {
      setError('');
      return;
    }

    const result = passwordSchema.safeParse(input);
    if (!result.success) {
      setError(result.error.issues[0].message);
    } else {
      setError('');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
        else onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="contents">
          <DialogHeader>
            <DialogTitle>호스트 권한 요청</DialogTitle>
            <DialogDescription>
              호스트가 되려면 비밀번호를 입력해 주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-1">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="host-password" className="text-right">
                비밀번호
              </Label>
              <div className="col-span-3">
                <InputGroup>
                  <InputGroupInput
                    id="host-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="호스트 비밀번호 입력"
                    autoFocus
                    maxLength={16}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </div>
            <div className={`h-4 ${!error ? 'invisible' : ''}`}>
              <p className="text-right text-[12px] text-red-500">{error}</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleClose}>
              취소
            </Button>
            <Button type="submit" disabled={!password.trim()}>
              요청하기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
