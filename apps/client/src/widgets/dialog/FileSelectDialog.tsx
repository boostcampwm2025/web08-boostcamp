import { Button, cn } from '@codejam/ui';
import {
  RadixDialog as Dialog,
  RadixDialogClose as DialogClose,
  RadixDialogContent as DialogContent,
  RadixDialogDescription as DialogDescription,
  RadixDialogFooter as DialogFooter,
  RadixDialogHeader as DialogHeader,
  RadixDialogTitle as DialogTitle,
} from '@codejam/ui';
import { useFileStore } from '@/stores/file';
import { useState, useMemo, useEffect, useRef } from 'react';
import type { FileMetadata } from '@/shared/lib/collaboration';
import { RadixInput as Input } from '@codejam/ui';
import { Search } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files;
    return files.filter((file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [files, searchQuery]);

  // 검색어 변경 시 첫 번째 항목 선택
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, filteredFiles.length]);

  // 다이얼로그 열릴 때 초기화
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // 선택된 항목이 보이도록 스크롤
  useEffect(() => {
    if (listRef.current && filteredFiles.length > 0) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex, filteredFiles.length]);

  const handleConfirm = () => {
    if (
      filteredFiles.length > 0 &&
      selectedIndex >= 0 &&
      selectedIndex < filteredFiles.length
    ) {
      const selectedFile = filteredFiles[selectedIndex];
      onSelectFile(selectedFile.id);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedIndex(0);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredFiles.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>파일 열기</DialogTitle>
          <DialogDescription>열고 싶은 파일을 선택하세요</DialogDescription>
        </DialogHeader>

        <div className="mb-2 flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="파일 검색..."
              className="h-9 pl-8"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto rounded-md border">
          {filteredFiles.length > 0 ? (
            <div className="p-2" ref={listRef}>
              {filteredFiles.map((file: FileMetadata, index: number) => (
                <div
                  key={file.id}
                  onClick={() => {
                    setSelectedIndex(index);
                    handleConfirm();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'cursor-pointer rounded px-3 py-2 text-sm transition-colors select-none',
                    selectedIndex === index
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground',
                  )}
                >
                  {file.name}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-center">
              <p className="text-muted-foreground text-sm">
                {searchQuery ? '검색 결과가 없습니다.' : '파일이 없습니다.'}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleConfirm}
            disabled={filteredFiles.length === 0}
          >
            열기
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary" size="sm">
              닫기
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
