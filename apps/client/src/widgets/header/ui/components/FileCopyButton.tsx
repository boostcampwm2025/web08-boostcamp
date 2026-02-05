import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from '@codejam/ui';
import { HeaderActionButton } from './HeaderActionButton';
import { useFileStore } from '@/stores/file';

const COPY_FEEDBACK_DURATION = 2000;

export function FileCopyButton() {
  const [isCopied, setIsCopied] = useState(false);
  const getActiveFileContent = useFileStore(
    (state) => state.getActiveFileContent,
  );

  const handleCopy = async () => {
    if (isCopied) return;

    const textContent = getActiveFileContent();

    if (textContent === null) {
      toast.error('선택된 파일이 없습니다.');
      return;
    }

    try {
      await navigator.clipboard.writeText(textContent);
      const message = '파일 내용을 복사했습니다.';
      toast.success(message);

      setIsCopied(true);
      setTimeout(() => setIsCopied(false), COPY_FEEDBACK_DURATION);
    } catch {
      const message = '파일 내용 복사에 실패했습니다.';
      toast.error(message);
    }
  };

  return (
    <HeaderActionButton onClick={handleCopy} className="hidden sm:flex">
      {isCopied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span className="hidden lg:inline">Copy</span>
    </HeaderActionButton>
  );
}
