import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@codejam/ui';
import { useFileStore } from '@/stores/file';
import type { FileMetadata } from '@/shared/lib/collaboration';
import { FileIcon } from 'lucide-react';

type FileSelectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFile: (fileId: string) => void;
};

export function FileSelectDialog({
  open,
  onOpenChange,
  onSelectFile,
}: FileSelectDialogProps) {
  const files = useFileStore((state) => state.files);

  const handleSelect = (fileId: string) => {
    onSelectFile(fileId);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command>
        <CommandInput placeholder="파일 검색..." />
        <CommandList>
          <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
          <CommandGroup heading="파일">
            {files.map((file: FileMetadata) => (
              <CommandItem
                key={file.id}
                onSelect={() => handleSelect(file.id)}
                className="hover:data-[selected=false]:bg-muted/50 data-[selected=false]:bg-transparent"
              >
                <FileIcon />
                <span>{file.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
