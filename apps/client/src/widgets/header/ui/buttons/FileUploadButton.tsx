/**
 * [!NOTE]
 * 현재 사용하지 않음 (이동됨)
 * files의 FileHeaderActions를 이용할 것
 */
import { useRef, type ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import { toast } from '@codejam/ui';
import { DuplicateDialog } from '@/widgets/dialog/DuplicateDialog';
import { useFileRename } from '@/shared/lib/hooks/useFileRename';
import { HeaderActionButton } from './HeaderActionButton';

interface FileUploadButtonProps {
  roomCode: string;
}

export function FileUploadButton({ roomCode }: FileUploadButtonProps) {
  const uploadRef = useRef<HTMLInputElement>(null);

  const { setIsDuplicated, isDuplicated, handleFileChange } =
    useFileRename(roomCode);

  const handleUploadButton = () => {
    if (!uploadRef.current) {
      toast.error('오류가 발생했습니다. 새로고침을 해주세요.');
      return;
    }

    uploadRef.current.click();
  };

  const handleUploadFile = (ev: ChangeEvent<HTMLInputElement>) => {
    const files = ev.target.files;
    handleFileChange(files);
    if (uploadRef.current) {
      uploadRef.current.value = '';
    }
  };

  return (
    <>
      <HeaderActionButton onClick={handleUploadButton}>
        <input
          type="file"
          multiple
          ref={uploadRef}
          className="hidden"
          accept="text/javascript,text/css,text/html,.ts,.tsx,.jsx"
          onChange={handleUploadFile}
        />
        <Upload className="h-4 w-4" />
        <span className="hidden lg:inline">Upload</span>
      </HeaderActionButton>
      <DuplicateDialog open={isDuplicated} onOpenChange={setIsDuplicated} />
    </>
  );
}
