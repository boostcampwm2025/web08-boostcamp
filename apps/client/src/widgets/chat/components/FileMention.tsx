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
 * - 파일이 삭제된 경우 "삭제됨" 표시
 */
export function FileMention({ fileName }: FileMentionProps) {
  const getFileId = useFileStore((state) => state.getFileId);
  const setActiveFile = useFileStore((state) => state.setActiveFile);
  const activeTabKey = useTabStore((state) => state.activeTabKey);
  const setActiveTab = useTabStore((state) => state.setActiveTab);
  const { appendLinear } = useContext(LinearTabApiContext);

  // 렌더링 시점에 파일 존재 여부 확인
  const fileId = getFileId(fileName);
  const isDeleted = !fileId;

  const handleClick = () => {
    if (isDeleted) return;

    setActiveFile(fileId);
    appendLinear(activeTabKey, fileName, {
      fileId,
      readOnly: false,
    });
    setActiveTab(activeTabKey, fileName);
  };

  // 삭제된 파일
  if (isDeleted) {
    return (
      <span className="border-muted/30 bg-muted/10 text-muted-foreground mx-0.5 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs line-through opacity-60">
        <FileText className="h-3 w-3 shrink-0" />
        <span className="truncate">{fileName}</span>
        <span className="text-[10px] no-underline">(삭제됨)</span>
      </span>
    );
  }

  // 존재하는 파일
  return (
    <button
      type="button"
      onClick={handleClick}
      className="group border-primary/20 from-primary/10 to-primary/5 text-primary hover:border-primary/40 hover:from-primary/20 hover:to-primary/10 relative mx-0.5 inline-flex cursor-pointer items-center gap-1 overflow-hidden rounded-md border bg-linear-to-r px-2 py-0.5 text-xs font-medium shadow-sm transition-all duration-200 ease-out hover:shadow-md active:scale-95"
    >
      {/* 배경 글로우 효과 */}
      <span className="bg-primary/5 absolute inset-0 -z-10 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />

      {/* 아이콘 */}
      <FileText className="h-3 w-3 shrink-0 transition-transform duration-200 group-hover:scale-110" />

      {/* 파일명 */}
      <span className="truncate">{fileName}</span>
    </button>
  );
}
