import { useState } from 'react';
import {
  Copy,
  Download,
  Edit2,
  Trash2,
  Check,
  MoreHorizontal,
} from 'lucide-react';
import {
  RadixPopover as Popover,
  RadixPopoverContent as PopoverContent,
  RadixPopoverTrigger as PopoverTrigger,
  toast,
  cn,
} from '@codejam/ui';
import { useFileStore } from '@/stores/file';

interface FileMoreMenuProps {
  fileId: string;
  fileName: string;
  isActive: boolean;
  onActionClick: (type: 'RENAME' | 'DELETE') => void;
}

const COPY_FEEDBACK_DURATION = 2000;

export function FileMoreMenu({
  fileId,
  fileName,
  isActive,
  onActionClick,
}: FileMoreMenuProps) {
  const [isCopied, setIsCopied] = useState(false);
  // 특정 파일의 컨텐츠를 가져오는 로직
  const getFileContent = useFileStore((state) => state.getFileContent);

  // 복사 로직
  const handleCopy = async () => {
    if (isCopied) return;
    const content = getFileContent(fileId);

    if (content === null) {
      toast.error('파일 내용을 읽을 수 없습니다.');
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      toast.success(`${fileName} 복사 완료`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), COPY_FEEDBACK_DURATION);
    } catch {
      toast.error('복사에 실패했습니다.');
    }
  };

  // 다운로드 로직
  const handleDownload = () => {
    const content = getFileContent(fileId);
    if (content === null) return;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${fileName} 다운로드 시작`);
  };

  return (
    <div
      className={cn(
        'transition-opacity duration-200',
        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
      )}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    >
      <Popover>
        <PopoverTrigger asChild>
          <button className="hover:bg-muted/80 flex h-6 w-6 items-center justify-center rounded-md transition-colors">
            <MoreHorizontal className="size-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="z-50 w-36 p-1" align="start">
          {/* 복사 버튼 */}
          <button
            onClick={handleCopy}
            className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isCopied ? (
              <Check className="size-3.5 text-green-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
            <span>내용 복사</span>
          </button>

          {/* 다운로드 버튼 */}
          <button
            onClick={handleDownload}
            className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Download className="size-3.5" />
            <span>다운로드</span>
          </button>

          <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

          {/* 이름 변경 */}
          <button
            onClick={() => onActionClick('RENAME')}
            className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Edit2 className="size-3.5" />
            <span>이름 변경</span>
          </button>

          {/* 삭제 */}
          <button
            onClick={() => onActionClick('DELETE')}
            className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-red-500 outline-none hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="size-3.5" />
            <span>삭제</span>
          </button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
