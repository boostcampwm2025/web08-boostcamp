import { useCallback, useContext, useRef, useState } from 'react';
import { Plus, Upload, Image } from 'lucide-react';
import { RadixButton as Button } from '@codejam/ui';
import { NewFileDialog } from '@/widgets/dialog/NewFileDialog';
import { DuplicateDialog } from '@/widgets/dialog/DuplicateDialog_new';
import { ImageUploadDialog } from '@/widgets/dialog/ImageUploadDialog';
import { useFileStore } from '@/stores/file';
import { useFileRename } from '@/shared/lib/hooks/useFileRename';
import { ActiveTabContext } from '@/contexts/TabProvider';
import { LinearTabApiContext } from '@/contexts/ProviderAPI';
import { uploadFile } from '@/shared/lib/file';
import { EXT_TYPES } from '@codejam/common';

const getAcceptedExtensions = () => {
  const extensions = EXT_TYPES.map((ext) => `.${ext}`);
  return ['text/*', ...extensions].join(',');
};

export function FileHeaderActions({ roomCode }: { roomCode: string }) {
  const { appendLinear } = useContext(LinearTabApiContext);
  const { activeTab } = useContext(ActiveTabContext);
  const uploadRef = useRef<HTMLInputElement>(null);
  const { getFileId, createFile, setActiveFile, getFileName } = useFileStore();
  const { handleCheckRename } = useFileRename(roomCode);

  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [currentDuplicate, setCurrentDuplicate] = useState<{
    name: string;
    file?: File;
  } | null>(null);

  const processNextPending = useCallback(
    async function internalProcess(remaining: File[]) {
      if (remaining.length === 0) {
        setIsDialogOpen(false);
        setCurrentDuplicate(null);
        setPendingFiles([]);
        return;
      }

      const nextFile = remaining[0];
      const nextRemaining = remaining.slice(1);

      // 파일 이름 중복 체크
      if (getFileId(nextFile.name)) {
        setCurrentDuplicate({ name: nextFile.name, file: nextFile });
        setPendingFiles(nextRemaining);
        setIsDialogOpen(true);
        return;
      }

      try {
        const { content, type } = await uploadFile(nextFile);
        createFile(nextFile.name, content, type);
        internalProcess(nextRemaining);
      } catch (error) {
        console.error('File upload failed:', error);
        internalProcess(nextRemaining);
      }
    },
    [createFile, getFileId],
  );

  // 새 파일 생성
  const handleNewFile = async (name: string) => {
    const fullNames = name;
    if (getFileId(fullNames)) {
      setCurrentDuplicate({ name: fullNames });
      setIsDialogOpen(true);
    } else {
      const result = await handleCheckRename(fullNames);
      if (result) {
        const fileId = createFile(fullNames, '');
        appendLinear(activeTab.active, fileId, {
          fileName: getFileName(fileId),
        });
        setActiveFile(fileId);
      }
    }
  };

  // 업로드
  const handleUploadFile = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const files = ev.target.files;
    if (!files) return;

    // 전체 파일 리스트를 큐로 넘김
    processNextPending(Array.from(files));
    if (uploadRef.current) uploadRef.current.value = '';
  };

  const handleImageUploadSubmit = (name: string, url: string) => {
    if (getFileId(name)) {
      const file = new File([url], name, { type: 'image/url' });
      setCurrentDuplicate({ name, file });
      setIsDialogOpen(true);
    } else {
      createFile(name, url, 'image');
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      <NewFileDialog onSubmit={handleNewFile}>
        <Button variant="ghost" size="icon" className="h-6 w-6" title="새 파일">
          <Plus size={16} />
        </Button>
      </NewFileDialog>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        title="파일 업로드"
        onClick={() => uploadRef.current?.click()}
      >
        <input
          type="file"
          multiple
          ref={uploadRef}
          className="hidden"
          accept={getAcceptedExtensions()}
          onChange={handleUploadFile}
        />
        <Upload size={10} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        title="이미지 공유"
        onClick={() => setIsUrlDialogOpen(true)}
      >
        <Image size={16} />
      </Button>
      <ImageUploadDialog
        open={isUrlDialogOpen}
        onOpenChange={setIsUrlDialogOpen}
        onSubmit={handleImageUploadSubmit}
      />

      {currentDuplicate && (
        <DuplicateDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          filename={currentDuplicate.name}
          file={currentDuplicate.file}
          onClick={() => processNextPending(pendingFiles)}
        />
      )}
    </div>
  );
}
