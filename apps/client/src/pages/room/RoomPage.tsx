import { useEffect } from 'react';
import { CodeEditor } from '@/widgets/code-editor';
import { Header } from '@/widgets/header';
import { Participants } from '@/widgets/participants';
import { useSocket } from '@/shared/lib/hooks/useSocket';
import { useRoomJoin } from '@/shared/lib/hooks/useRoomJoin';
import { useRoomStore } from '@/stores/room';
import { usePt } from '@/stores/pts';
import { Toaster } from '@/shared/ui/sonner';
import { FileList } from '@/widgets/files';
import { useFileStore } from '@/stores/file';
import { useLoaderData } from 'react-router-dom';
import { ErrorDialog } from '@/widgets/error-dialog/ErrorDialog';
import type { RoomJoinStatus } from '@codejam/common';
import { PrepareStage } from './PrepareStage';

function RoomPage() {
  const {
    paramCode,
    isNicknameDialogOpen,
    isPasswordDialogOpen,
    setIsPasswordDialogOpen,
    setIsNicknameDialogOpen,
    roomError,
    passwordError,
    handleNicknameConfirm,
    handlePasswordConfirm,
  } = useRoomJoin();

  const setRoomCode = useRoomStore((state) => state.setRoomCode);
  const activeFileId = useFileStore((state) => state.activeFileId);

  const loader = useLoaderData<RoomJoinStatus>();

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
        <div className="border-r border-border h-full overflow-y-auto scrollbar-thin flex flex-col bg-sidebar w-64 shrink-0">
          <Participants />
          <FileList />
        </div>
        <div className="flex-1 h-full bg-background">
          <CodeEditor
            fileId={activeFileId || 'prototype'}
            language="javascript"
            readOnly={isViewer}
          />
        </div>
      </main>
      {loader === 'FULL' ? (
        <ErrorDialog
          title="사람이 가득 찼습니다!"
          description="현재 방에 인원이 많습니다."
          buttonLabel="뒤로가기"
          onSubmit={() => {
            window.location.href = '/';
          }}
        />
      ) : (
        <PrepareStage
          isNicknameDialogOpen={isNicknameDialogOpen}
          isPasswordDialogOpen={isPasswordDialogOpen}
          setIsNicknameDialogOpen={setIsNicknameDialogOpen}
          setIsPasswordDialogOpen={setIsPasswordDialogOpen}
          passwordError={passwordError}
          handleNicknameConfirm={handleNicknameConfirm}
          handlePasswordConfirm={handlePasswordConfirm}
        />
      )}
      <Toaster />
    </div>
  );
}

export default RoomPage;
