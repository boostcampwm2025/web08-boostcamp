import type { ExtType } from '@/shared/lib/file';
import {
  RadixButton as Button,
  RadixInput as Input,
  RadixLabel as Label,
  RadixDialogClose as DialogClose,
  RadixDialogContent as DialogContent,
  RadixDialogDescription as DialogDescription,
  RadixDialogFooter as DialogFooter,
  RadixDialogHeader as DialogHeader,
  RadixDialogTitle as DialogTitle,
  RadixSelect as Select,
  RadixSelectContent as SelectContent,
  RadixSelectGroup as SelectGroup,
  RadixSelectItem as SelectItem,
  RadixSelectLabel as SelectLabel,
  RadixSelectTrigger as SelectTrigger,
  RadixSelectValue as SelectValue,
} from '@codejam/ui';
import { useFileStore } from '@/stores/file';
import { useContext, useState, type ChangeEvent, type FormEvent } from 'react';
import { LinearTabApiContext } from '@/contexts/ProviderAPI';
import { ActiveTabContext } from '@/contexts/TabProvider';

type RenameDialogProps = {
  fileId: string;
  filePurename: string;
  fileExt: ExtType;
  onOpen: (value: boolean) => void;
};

export function RenameDialog({
  fileId,
  filePurename,
  fileExt,
  onOpen,
}: RenameDialogProps) {
  const [filename, setFilename] = useState(filePurename);
  const [helperMessage, setHelperMessage] = useState('');
  const [extname, setExtname] = useState<ExtType>(fileExt);
  const getFileId = useFileStore((state) => state.getFileId);
  const renameFile = useFileStore((state) => state.renameFile);
  const { updateLinearTab } = useContext(LinearTabApiContext);
  const { activeTab } = useContext(ActiveTabContext);

  const errorPass = (): boolean => {
    if (filename.trim().length === 0) {
      setHelperMessage('파일 이름을 입력해주세요.');
      return false;
    }

    if (!extname) {
      setHelperMessage('파일 확장자를 정해주세요.');
      return false;
    }

    const combine = `${filename.trim()}.${extname}`;
    if (getFileId(combine)) {
      setHelperMessage('이미 존재하는 파일 입니다.');
      return false;
    }

    return true;
  };

  const clear = () => {
    setFilename('');
    setHelperMessage('');
    onOpen(false);
  };

  const handleChangeFilename = (ev: ChangeEvent<HTMLInputElement>) => {
    setFilename(ev.target.value);
  };

  const handleChangeExtname = (value: string) => setExtname(value as ExtType);
  const handleOnSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!errorPass()) {
      return;
    }

    // Rename file
    const newName = `${filename.trim()}.${extname}`;
    renameFile(fileId, newName);
    updateLinearTab(activeTab.active, fileId, {
      fileName: newName,
    });

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
            defaultValue={filePurename}
            onChange={handleChangeFilename}
            className="h-9"
          />
          <Select value={extname} onValueChange={handleChangeExtname}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="확장자 선택" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectGroup>
                <SelectLabel>확장자</SelectLabel>
                <SelectItem value="c">.c</SelectItem>
                <SelectItem value="cpp">.cpp</SelectItem>
                <SelectItem value="css">.css</SelectItem>
                <SelectItem value="html">.html</SelectItem>
                <SelectItem value="java">.java</SelectItem>
                <SelectItem value="js">.js</SelectItem>
                <SelectItem value="jsx">.jsx</SelectItem>
                <SelectItem value="py">.py</SelectItem>
                <SelectItem value="ts">.ts</SelectItem>
                <SelectItem value="tsx">.tsx</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {helperMessage && (
          <p className="text-destructive text-[12px] text-red-500">
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
