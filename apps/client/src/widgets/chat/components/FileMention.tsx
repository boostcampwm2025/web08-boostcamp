import { useContext } from 'react';
import { FileText } from 'lucide-react';
import { useFileStore } from '@/stores/file';
import { useTabStore } from '@/stores/tab';
import { LinearTabApiContext } from '@/contexts/ProviderAPI';

type FileMentionProps = {
  fileName: string;
};

/**
 * 파일 언급 UI 컴포넌트
 * - 배지 스타일로 표시
 * - 클릭 시 해당 파일 열기
 */
export function FileMention({ fileName }: FileMentionProps) {
  const getFileId = useFileStore((state) => state.getFileId);
  const setActiveFile = useFileStore((state) => state.setActiveFile);
  const activeTabKey = useTabStore((state) => state.activeTabKey);
  const setActiveTab = useTabStore((state) => state.setActiveTab);
  const { appendLinear } = useContext(LinearTabApiContext);

  const handleClick = () => {
    const fileId = getFileId(fileName);

    if (fileId) {
      setActiveFile(fileId);
      appendLinear(activeTabKey, fileName, {
        fileId,
        readOnly: false,
      });
      setActiveTab(activeTabKey, fileName);
    } else {
      console.warn(`[FileMention] 파일을 찾을 수 없습니다: ${fileName}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group relative mx-0.5 inline-flex cursor-pointer items-center gap-1 overflow-hidden rounded-md border border-primary/20 bg-linear-to-r from-primary/10 to-primary/5 px-2 py-0.5 text-xs font-medium text-primary shadow-sm transition-all duration-200 ease-out hover:border-primary/40 hover:from-primary/20 hover:to-primary/10 hover:shadow-md active:scale-95"
    >
      {/* 배경 글로우 효과 */}
      <span className="absolute inset-0 -z-10 bg-primary/5 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* 아이콘 */}
      <FileText className="h-3 w-3 shrink-0 transition-transform duration-200 group-hover:scale-110" />
      
      {/* 파일명 */}
      <span className="truncate">{fileName}</span>
    </button>
  );
}
