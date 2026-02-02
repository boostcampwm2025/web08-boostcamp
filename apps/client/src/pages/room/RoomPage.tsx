import { useEffect, type DragEvent } from 'react';
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
import { ConsolePanel as Output } from '@/widgets/console';
import { useDarkMode } from '@/shared/lib/hooks/useDarkMode';
import { Chat } from '@/widgets/chat';
import { RoomSidebar } from '@/widgets/room-sidebar';
import { ProviderAPI } from '@/contexts/ProviderAPI';
import { TabProvider } from '@/contexts/TabProvider';
import TabViewer from './TabViewer';
import { TabLayout } from './TabLayout';

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

  const setActiveFile = useFileStore((state) => state.setActiveFile);
  const activeFileId = useFileStore((state) => state.activeFileId);
  const setRoomCode = useRoomStore((state) => state.setRoomCode);
  const getFileName = useFileStore((state) => state.getFileName);

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
    if (files.length > 0) {
      handleFileChange(files);
    }
  };

  const convertProcessFn = (fileId: string) => {
    return {
      fileName: getFileName(fileId),
    };
  };

  const handleOnActiveTab = (_: number, key: string) => {
    setActiveFile(key);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header roomCode={paramCode!} />
      <div className="flex min-h-0 flex-1">
        {roomError && (
          <div className="bg-red-500 p-4 text-center text-white">
            {roomError}
          </div>
        )}
        <main className="flex min-h-0 flex-1">
          <TabProvider>
            <ProviderAPI>
              <RoomSidebar />
              <div
                className="bg-background flex h-full min-h-0 flex-1 flex-col"
                onDragOver={handleDragPrevent}
                onDrop={handleFileDrop}
              >
                <TabLayout
                  min={1}
                  max={2}
                  keyName="fileId"
                  convertProcessFn={convertProcessFn}
                  onCreateLinearTab={handleOnActiveTab}
                  onAppendLinearTab={handleOnActiveTab}
                  initialTabValue={{
                    key: activeFileId,
                    value: {
                      fileName: getFileName(activeFileId),
                    },
                  }}
                >
                  {(tabKey: number) => (
                    <TabViewer tabKey={tabKey} readOnly={isViewer} />
                  )}
                </TabLayout>
              </div>
              <Chat />
            </ProviderAPI>
          </TabProvider>
          <Output variant={isDark ? 'dark' : 'light'} />
        </main>
      </div>
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
    </div>
  );
}

export default RoomPage;
