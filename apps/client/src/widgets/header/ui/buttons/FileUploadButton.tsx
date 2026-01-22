import { useRef, useState, type ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { extname } from '@/shared/lib/file';
import { DuplicateDialog } from '@/widgets/dialog/DuplicateDialog';
import { useFileStore } from '@/stores/file';
import { useFileRename } from '@/shared/lib/hooks/useFileRename';
import { HeaderActionButton } from './HeaderActionButton';

interface FileUploadButtonProps {
  roomCode: string;
}

export function FileUploadButton({ roomCode }: FileUploadButtonProps) {
  const uploadRef = useRef<HTMLInputElement>(null);
  const { getFileId, createFile, setActiveFile } = useFileStore();
  const { setIsDuplicated, isDuplicated, handleCheckRename } =
    useFileRename(roomCode);
  const [uploadFile, setUploadFile] = useState<File | undefined>(undefined);
  const [filename, setFilename] = useState('');

  const handleUploadButton = () => {
    if (!uploadRef.current) {
      toast.error('오류가 발생했습니다. 새로고침을 해주세요.');
      return;
    }

    uploadRef.current.click();
  };

  const handleFileChange = async (ev: ChangeEvent<HTMLInputElement>) => {
    const currentMimes = ['text/javascript', 'text/html', 'text/css'];
    const MAX_SIZE = 1024 * 1024;

    const files = ev.target.files;

    if (!roomCode) {
      toast.error('유효하지 않은 방 코드입니다.');
      return;
    }

    if (!files || files.length === 0) {
      toast.error('파일을 하나 이상 선택해주세요.');
      return;
    }

    const file = files[0];
    if (uploadRef.current) {
      uploadRef.current.value = '';
    }

    if (!currentMimes.includes(file.type) && !extname(file.name)) {
      toast.error('정해진 파일 타입만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error('파일의 크기가 1MB 를 초과했습니다.');
      return;
    }

    setUploadFile(file);

    if (getFileId(file.name)) {
      setFilename(file.name);
      setIsDuplicated(true);
    } else {
      const result = await handleCheckRename(file.name);
      if (result) {
        const content = await file.text();
        const fileId = createFile(file.name, content);
        setActiveFile(fileId);
        setUploadFile(undefined);
      }
    }
  };

  const handleDuplicateDialogClose = () => {
    setUploadFile(undefined);
    setFilename('');
  };

  return (
    <>
      <HeaderActionButton onClick={handleUploadButton}>
        <input
          type="file"
          ref={uploadRef}
          className="hidden"
          accept="text/javascript,text/css,text/html,.ts,.tsx,.jsx"
          onChange={handleFileChange}
        />
        <Upload className="h-4 w-4" />
        <span className="hidden lg:inline">Upload</span>
      </HeaderActionButton>

      <DuplicateDialog
        open={isDuplicated}
        onOpenChange={setIsDuplicated}
        filename={filename}
        file={uploadFile}
        onClick={handleDuplicateDialogClose}
      />
    </>
  );
}
