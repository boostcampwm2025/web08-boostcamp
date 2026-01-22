import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { HeaderActionButton } from './HeaderActionButton';

export function FileDownloadButton() {
  const handleDownload = () => {
    toast.warning('Download 기능은 아직 구현되지 않았습니다.', {
      description: '추후 업데이트될 예정입니다.',
    });
  };

  return (
    <HeaderActionButton onClick={handleDownload}>
      <Download className="h-4 w-4" />
      <span className="hidden lg:inline">Download</span>
    </HeaderActionButton>
  );
}
