import {
  RadixButton as Button,
  RadixInput as Input,
  RadixLabel as Label,
} from '@codejam/ui';
import {
  RadixDialogClose as DialogClose,
  RadixDialogContent as DialogContent,
  RadixDialogDescription as DialogDescription,
  RadixDialogFooter as DialogFooter,
  RadixDialogHeader as DialogHeader,
  RadixDialogTitle as DialogTitle,
} from '@codejam/ui';
import { useFileStore } from '@/stores/file';
import { useState, type ChangeEvent, type FormEvent } from 'react';

type RenameDialogProps = {
  fileId: string;
  fileName: string;
  onOpen: (value: boolean) => void;
};

export function RenameDialog({ fileId, fileName, onOpen }: RenameDialogProps) {
  const [newFilename, setNewFilename] = useState(fileName);
  const [helperMessage, setHelperMessage] = useState('');
  const getFileId = useFileStore((state) => state.getFileId);
  const renameFile = useFileStore((state) => state.renameFile);

  const errorPass = (): boolean => {
    const name = newFilename.trim();

    if (name.length === 0) {
      setHelperMessage('파일 이름을 입력해주세요.');
      return false;
    }

    if (name !== fileName && getFileId(name)) {
      setHelperMessage('이미 존재하는 파일입니다.');
      return false;
    }

    return true;
  };

  const clear = () => {
    setNewFilename('');
    setHelperMessage('');
    onOpen(false);
  };

  const handleChangeFilename = (ev: ChangeEvent<HTMLInputElement>) => {
    setNewFilename(ev.target.value);
  };

  const handleOnSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!errorPass()) {
      return;
    }

    // Rename file
    const newName = newFilename.trim();
    renameFile(fileId, newName);

    clear();
  };

  return (
    <DialogContent className="sm:max-w-md">
      <form onSubmit={handleOnSubmit}>
        <DialogHeader>
          <DialogTitle>파일 이름 변경</DialogTitle>
          <DialogDescription>파일의 이름을 변경합니다.</DialogDescription>
        </DialogHeader>
        <div className="mt-2 mb-2 flex items-center space-x-2">
          <Label htmlFor="filename" className="sr-only">
            파일명
          </Label>
          <Input
            id="filename"
            value={newFilename}
            onChange={handleChangeFilename}
            className="h-9"
            autoFocus
          />
        </div>
        {helperMessage && (
          <p className="text-destructive p-0.5 text-[12px] text-red-500">
            {helperMessage}
          </p>
        )}
        <DialogFooter className="sm:justify-start">
          <Button type="submit" variant="default" size="sm">
            변경
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary" size="sm">
              닫기
            </Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
