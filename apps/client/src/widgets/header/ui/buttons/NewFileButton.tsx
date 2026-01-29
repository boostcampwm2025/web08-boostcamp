import { Plus } from 'lucide-react';
import { NewFileDialog } from '@/widgets/dialog/NewFileDialog';
import { DuplicateDialog } from '@/widgets/dialog/DuplicateDialog';
import { useFileStore } from '@/stores/file';
import { useFileRename } from '@/shared/lib/hooks/useFileRename';
import { HeaderActionButton } from './HeaderActionButton';

interface NewFileButtonProps {
  roomCode: string;
}

export function NewFileButton({ roomCode }: NewFileButtonProps) {
  const { getFileId, createFile, setActiveFile } = useFileStore();
  const { setIsDuplicated, isDuplicated, handleCheckRename } =
    useFileRename(roomCode);
  const handleNewFile = async (name: string, ext: string) => {
    const newFilename = `${name}.${ext}`;
    if (getFileId(newFilename)) {
      setIsDuplicated(true);
    } else {
      const result = await handleCheckRename(newFilename);
      if (result) {
        const fileId = createFile(newFilename, '');
        setActiveFile(fileId);
      }
    }
  };

  return (
    <>
      <NewFileDialog onSubmit={handleNewFile}>
        <HeaderActionButton>
          <Plus className="h-4 w-4" />
          <span className="hidden lg:inline">New File</span>
        </HeaderActionButton>
      </NewFileDialog>

      <DuplicateDialog open={isDuplicated} onOpenChange={setIsDuplicated} />
    </>
  );
}
