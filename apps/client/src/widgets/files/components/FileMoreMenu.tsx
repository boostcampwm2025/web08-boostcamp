import { useState } from 'react';
import { Copy, Download, Edit2, Trash2, Check } from 'lucide-react';
import { toast, cn, Button } from '@codejam/ui';
import { useFileStore } from '@/stores/file';
import { copyFile, downloadFile } from '@/shared/lib/file';

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
  const getFileContent = useFileStore((state) => state.getFileContent);
  const getFileType = useFileStore((state) => state.getFileType);

  const handleCopy = async () => {
    if (isCopied) return;
    const content = getFileContent(fileId);
    const type = getFileType(fileId);

    if (content === null || type === null) {
      toast.error('파일 내용을 읽을 수 없습니다.');
      return;
    }

    try {
      await copyFile(content, type);
      const message = `${fileName} 복사 완료`;

      toast.success(message);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), COPY_FEEDBACK_DURATION);
    } catch {
      toast.error('복사에 실패했습니다.');
    }
  };

  const handleDownload = async () => {
    const content = getFileContent(fileId);
    const type = getFileType(fileId);

    if (content === null || type === null) {
      toast.error('파일을 다운로드할 수 없습니다.');
      return;
    }

    try {
      await downloadFile(fileName, content, type);
      toast.success(`${fileName} 다운로드 시작`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('다운로드에 실패했습니다.');
    }
  };

  return (
    <div
      className={cn(
        'animate-in fade-in slide-in-from-right-1 items-center duration-200',
        isActive ? 'flex' : 'hidden group-hover:flex',
      )}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    >
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={handleCopy}
        className="text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        title="내용 복사"
      >
        {isCopied ? (
          <Check className="size-4 text-green-500" />
        ) : (
          <Copy className="size-4" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon-xs"
        onClick={handleDownload}
        className="text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        title="다운로드"
      >
        <Download className="size-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => onActionClick('RENAME')}
        className="text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        title="이름 변경"
      >
        <Edit2 className="size-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => onActionClick('DELETE')}
        className="text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
        title="삭제"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
