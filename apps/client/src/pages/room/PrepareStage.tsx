import { NicknameInputDialog } from '@/widgets/nickname-input';
import { PasswordDialogProps } from '@/widgets/password-input/PasswordInputDialog';
import type { Dispatch, SetStateAction } from 'react';

type PrepareStageProps = {
  isNicknameDialogOpen: boolean;
  isPasswordDialogOpen: boolean;
  setIsNicknameDialogOpen: Dispatch<SetStateAction<boolean>>;
  setIsPasswordDialogOpen: Dispatch<SetStateAction<boolean>>;
  passwordError: string;
  handleNicknameConfirm: (nickname: string) => void;
  handlePasswordConfirm: (password: string) => void;
};

export function PrepareStage({
  isNicknameDialogOpen,
  handleNicknameConfirm,
  isPasswordDialogOpen,
  passwordError,
  setIsNicknameDialogOpen,
  setIsPasswordDialogOpen,
  handlePasswordConfirm,
}: PrepareStageProps) {
  return (
    <>
      <PasswordDialogProps
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        passwordError={passwordError}
        onConfirm={handlePasswordConfirm}
      />
      <NicknameInputDialog
        open={isNicknameDialogOpen}
        onOpenChange={setIsNicknameDialogOpen}
        onConfirm={handleNicknameConfirm}
      />
    </>
  );
}
