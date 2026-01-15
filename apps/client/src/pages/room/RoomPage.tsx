import { useEffect } from 'react';
import { CodeEditor } from '@/widgets/code-editor';
import { Header } from '@/widgets/header';
import { Participants } from '@/widgets/participants';
import { useSocket } from '@/shared/lib/hooks/useSocket';
import { useRoomJoin } from '@/shared/lib/hooks/useRoomJoin';
import { useRoomStore } from '@/stores/room';
import { usePt } from '@/stores/pts';
import { NicknameInputDialog } from '@/widgets/nickname-input';
import { Toaster } from '@/shared/ui/sonner';
import { FileList } from '@/widgets/files';
import { useFileStore } from '@/stores/file';

function RoomPage() {
  const {
    paramCode,
    isNicknameDialogOpen,
    setIsNicknameDialogOpen,
    roomError,
    handleNicknameConfirm,
  } = useRoomJoin();

  const setRoomCode = useRoomStore((state) => state.setRoomCode);
  const activeFileId = useFileStore((state) => state.activeFileId);

  useSocket(paramCode || '');

  useEffect(() => {
    if (!paramCode) {
      throw new Error('Invalid roomCode');
    }

    setRoomCode(paramCode);
  }, [paramCode, setRoomCode]);

  const myPtId = useRoomStore((state) => state.myPtId);
  const myPt = usePt(myPtId || '');
  const isViewer = myPt?.role === 'viewer';

  return (
    <div className="flex flex-col h-screen">
      <Header roomCode={paramCode!} />
      {roomError && (
        <div className="bg-red-500 text-white p-4 text-center">{roomError}</div>
      )}
      <main className="flex-1 overflow-hidden flex">
        <div className="border-r h-full overflow-y-auto scrollbar-thin flex flex-col">
          <div className="grow">
            <Participants />
          </div>
          <div className="grow">
            <FileList />
          </div>
        </div>
        <div className="flex-1 h-full">
          <CodeEditor
            fileId={activeFileId || 'prototype'}
            language="javascript"
            readOnly={isViewer}
          />
        </div>
      </main>
      <NicknameInputDialog
        open={isNicknameDialogOpen}
        onOpenChange={setIsNicknameDialogOpen}
        onConfirm={handleNicknameConfirm}
      />
      <Toaster />
    </div>
  );
}

export default RoomPage;
