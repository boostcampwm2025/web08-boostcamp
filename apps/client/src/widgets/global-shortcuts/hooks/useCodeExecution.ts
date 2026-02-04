import { useFileStore } from '@/stores/file';
import { useCodeExecutionStore } from '@/stores/code-execution';
import { emitExecuteCode } from '@/stores/socket-events';
import { extname, getPistonLanguage } from '@/shared/lib/file';
import { useSettings } from '@/shared/lib/hooks/useSettings';
import { toast } from '@codejam/ui';

export function useCodeExecution() {
  const activeFileId = useFileStore((state) => state.activeFileId);
  const getFileName = useFileStore((state) => state.getFileName);
  const isExecuting = useCodeExecutionStore((state) => state.isExecuting);
  const { streamCodeExecutionOutput } = useSettings();

  const handleExecuteCode = () => {
    if (!activeFileId) {
      toast.error('선택된 파일이 없습니다.');
      return;
    }

    const fileName = getFileName(activeFileId);
    if (!fileName) {
      toast.error('파일 이름을 가져올 수 없습니다.');
      return;
    }

    const extension = extname(fileName);
    if (!extension) {
      toast.error('파일 확장자를 찾을 수 없습니다.');
      return;
    }

    const language = getPistonLanguage(extension);
    if (!language) {
      toast.error('코드 실행을 지원하지 않는 파일입니다.');
      return;
    }

    if (isExecuting) {
      toast.warning('코드가 이미 실행 중입니다.');
      return;
    }

    emitExecuteCode(activeFileId, language, streamCodeExecutionOutput);
  };

  return { handleExecuteCode };
}
