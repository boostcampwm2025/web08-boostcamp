import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { HeaderActionButton } from './HeaderActionButton';

export function FileCopyButton() {
  const handleCopy = () => {
    toast.warning('Copy 기능은 아직 구현되지 않았습니다.', {
      description: '추후 업데이트될 예정입니다.',
    });
  };

  return (
    <HeaderActionButton
      onClick={handleCopy}
      className="hidden sm:flex"
    >
      <Copy className="h-4 w-4" />
      <span className="hidden lg:inline">Copy</span>
    </HeaderActionButton>
  );
}
