import { Play, Loader2 } from 'lucide-react';
import { toast } from '@codejam/ui';
import { HeaderActionButton } from './HeaderActionButton';
import { useFileStore } from '@/stores/file';
import { useCodeExecutionStore } from '@/stores/code-execution';
import { emitExecuteCode } from '@/stores/socket-events';
import { extname, getPistonLanguage } from '@/shared/lib/file';
import { useSettings } from '@/shared/lib/hooks/useSettings';

export function CodeExecutionButton() {
  const activeFileId = useFileStore((state) => state.activeFileId);
  const getFileName = useFileStore((state) => state.getFileName);
  const isExecuting = useCodeExecutionStore((state) => state.isExecuting);
  const { streamCodeExecutionOutput } = useSettings();

  const handleExecute = () => {
    if (isExecuting) {
      toast.warning('코드가 이미 실행 중입니다.');
      return;
    }

    if (!activeFileId) {
      toast.error('선택된 파일이 없습니다.');
      return;
    }

    // Get file name from file store

    const fileName = getFileName(activeFileId);
    if (!fileName) {
      toast.error('파일 이름을 가져올 수 없습니다.');
      return;
    }

    // Extract language from file extension
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

    emitExecuteCode(activeFileId, language, streamCodeExecutionOutput);
  };

  return (
    <HeaderActionButton
      onClick={handleExecute}
      disabled={isExecuting}
      className="hidden sm:flex"
    >
      <Run loading={isExecuting} />
      <span className="hidden lg:inline">Run</span>
    </HeaderActionButton>
  );
}

type IconProps = {
  loading: boolean;
};

function Run({ loading }: IconProps) {
  const play = <Play className="h-4 w-4" />;
  const loader = <Loader2 className="h-4 w-4 animate-spin" />;
  return loading ? loader : play;
}
