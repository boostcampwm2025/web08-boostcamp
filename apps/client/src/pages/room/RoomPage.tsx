import { useEffect, type DragEvent } from 'react';
import { CodeEditor } from '@/widgets/code-editor';
import { EmptyView } from './EmptyView';
import { Header } from '@/widgets/header';
import { useSocket } from '@/shared/lib/hooks/useSocket';
import { useRoomJoin } from '@/shared/lib/hooks/useRoomJoin';
import { useRoomStore } from '@/stores/room';
import { usePt } from '@/stores/pts';
import { RadixToaster as Toaster } from '@codejam/ui';
import { useFileStore } from '@/stores/file';
import { useLoaderData } from 'react-router-dom';
import { ErrorDialog } from '@/widgets/error-dialog/ErrorDialog';
import { HostClaimRequestDialog } from '@/widgets/dialog/HostClaimRequestDialog';
import { ROLE, type RoomJoinStatus } from '@codejam/common';
import { PrepareStage } from './PrepareStage';
import { useAwarenessSync } from '@/shared/lib/hooks/useAwarenessSync';
import { useInitialFileSelection } from '@/shared/lib/hooks/useInitialFileSelection';
import { useFileRename } from '@/shared/lib/hooks/useFileRename';
import { DuplicateDialog } from '@/widgets/dialog/DuplicateDialog';
import { Terminal } from '@/widgets/terminal';
import { AlignLeft } from 'lucide-react';
import { useDarkMode } from '@/shared/lib/hooks/useDarkMode';
import { Chat } from '@/widgets/chat';
import { RoomSidebar } from '@/widgets/room-sidebar';

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
  const { setIsDuplicated, isDuplicated, handleFileChange } = useFileRename(
    paramCode || '',
  );

  useAwarenessSync();
  useInitialFileSelection();

  const setRoomCode = useRoomStore((state) => state.setRoomCode);
  const activeFileId = useFileStore((state) => state.activeFileId);

  const loader = useLoaderData<RoomJoinStatus>();

  useSocket(paramCode || '');

  const { isDark } = useDarkMode();

  useEffect(() => {
    if (!paramCode) {
      throw new Error('Invalid roomCode');
    }

    setRoomCode(paramCode);
  }, [paramCode, setRoomCode]);

  const myPtId = useRoomStore((state) => state.myPtId);
  const myPt = usePt(myPtId || '');
  const isViewer = myPt?.role === ROLE.VIEWER;

  const handleDragPrevent = (ev: DragEvent) => {
    ev.preventDefault();
  };

  const handleFileDrop = (ev: DragEvent) => {
    ev.preventDefault();
    const files = ev.dataTransfer.files;
    handleFileChange(files);
  };

  return (
    <div className="flex h-screen flex-col">
      <Header roomCode={paramCode!} />
      {roomError && (
        <div className="bg-red-500 p-4 text-center text-white">{roomError}</div>
      )}
      <main className="flex flex-1 overflow-hidden">
        <RoomSidebar />
        <div
          className="bg-background h-full flex-1"
          onDragOver={handleDragPrevent}
          onDrop={handleFileDrop}
        >
          <FileViewer fileId={activeFileId} readOnly={isViewer} />
        </div>
        <div className="border-border h-full w-96 shrink-0 border-l">
          <Output variant={isDark ? 'dark' : 'light'} />
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
      <DuplicateDialog open={isDuplicated} onOpenChange={setIsDuplicated} />
      <HostClaimRequestDialog />
      <Chat />
    </div>
  );
}

interface FileViewerProps {
  fileId: string | null;
  readOnly: boolean;
}

function FileViewer({ fileId, readOnly }: FileViewerProps) {
  if (!fileId) return <EmptyView />;

  return <CodeEditor fileId={fileId} readOnly={readOnly} />;
}

interface OutputProps {
  variant: 'light' | 'dark';
}

function Output({ variant }: OutputProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-border flex items-center justify-between border-b bg-white px-3 py-2 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <AlignLeft size={16} className="text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Output
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Terminal variant={variant} />
      </div>
    </div>
  );
}

export default RoomPage;
