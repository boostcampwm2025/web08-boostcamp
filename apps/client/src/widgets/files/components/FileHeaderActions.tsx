import { useCallback, useContext, useRef, useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { RadixButton as Button } from '@codejam/ui';
import { NewFileDialog } from '@/widgets/dialog/NewFileDialog';
import { DuplicateDialog } from '@/widgets/dialog/DuplicateDialog_new';
import { useFileStore } from '@/stores/file';
import { useFileRename } from '@/shared/lib/hooks/useFileRename';
import { ActiveTabContext } from '@/contexts/TabProvider';
import { LinearTabApiContext } from '@/contexts/ProviderAPI';

export function FileHeaderActions({ roomCode }: { roomCode: string }) {
  const { appendLinear } = useContext(LinearTabApiContext);
  const { activeTab } = useContext(ActiveTabContext);
  const uploadRef = useRef<HTMLInputElement>(null);
  const { getFileId, createFile, setActiveFile, getFileName } = useFileStore();
  const { handleCheckRename } = useFileRename(roomCode);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [currentDuplicate, setCurrentDuplicate] = useState<{
    name: string;
    file?: File;
  } | null>(null);

  const processNextPending = useCallback(
    function internalProcess(remaining: File[]) {
      if (remaining.length === 0) {
        setIsDialogOpen(false);
        setCurrentDuplicate(null);
        setPendingFiles([]);
        return;
      }

      const nextFile = remaining[0];
      const nextRemaining = remaining.slice(1);

      if (getFileId(nextFile.name)) {
        setCurrentDuplicate({ name: nextFile.name, file: nextFile });
        setPendingFiles(nextRemaining);
        setIsDialogOpen(true);
      } else {
        // 중복이 아니면 바로 생성하고 다음 파일 확인
        nextFile.text().then((content) => {
          createFile(nextFile.name, content);
          internalProcess(nextRemaining);
        });
      }
    },
    [createFile, getFileId],
  );

  // 새 파일 생성
  const handleNewFile = async (name: string, ext: string) => {
    const fullNames = `${name}.${ext}`;
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

  return (
    <div className="flex items-center gap-0.5">
      <NewFileDialog onSubmit={handleNewFile}>
        <Button variant="ghost" size="icon" className="h-7 w-7" title="새 파일">
          <Plus size={16} />
        </Button>
      </NewFileDialog>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        title="파일 업로드"
        onClick={() => uploadRef.current?.click()}
      >
        <input
          type="file"
          multiple
          ref={uploadRef}
          className="hidden"
          onChange={handleUploadFile}
        />
        <Upload size={16} />
      </Button>

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
