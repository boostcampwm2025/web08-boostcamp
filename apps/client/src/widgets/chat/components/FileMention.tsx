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
      // File.tsx와 동일한 로직
      setActiveFile(fileId);
      appendLinear(activeTabKey, fileName, {
        fileId,
        readOnly: false, // 기본값
      });
      setActiveTab(activeTabKey, fileName);
    } else {
      // 파일이 삭제된 경우
      console.warn(`[FileMention] 파일을 찾을 수 없습니다: ${fileName}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1 rounded bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/25"
    >
      <FileText className="h-3 w-3" />
      {fileName}
    </button>
  );
}
