import { useContext, useEffect, useMemo, type DragEvent } from 'react';
import { CodeEditor } from '@/widgets/code-editor';
import { EmptyView } from './EmptyView';
import { Header } from '@/widgets/header';
import { useSocket } from '@/shared/lib/hooks/useSocket';
import { useRoomJoin } from '@/shared/lib/hooks/useRoomJoin';
import { useRoomStore } from '@/stores/room';
import { usePt } from '@/stores/pts';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  RadixToaster as Toaster,
  RadixContextMenu as ContextMenu,
  RadixContextMenuContent as ContextMenuContent,
  RadixContextMenuItem as ContextMenuItem,
  RadixContextMenuTrigger as ContextMenuTrigger,
  ScrollArea,
  ScrollBar,
} from '@codejam/ui';
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
import { LinearGrid } from './LinearGrid';
import { LinearTabApiContext, ProviderAPI } from '@/contexts/ProviderAPI';
import { TabProvider } from '@/contexts/TabProvider';
import { Trash2 } from 'lucide-react';
import { useTabStore } from '@/stores/tab';

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
    const fileName = getFileName(fileId);
    if (!fileName) {
      return {};
    }

    return {
      fileId,
      readOnly: isViewer,
    };
  };

  const convertKeyName = (key: string) => {
    const fileName = getFileName(key);
    return fileName!;
  };

  return (
    <div className="flex h-screen flex-col">
      <Header roomCode={paramCode!} />
      {roomError && (
        <div className="bg-red-500 p-4 text-center text-white">{roomError}</div>
      )}
      <main className="flex flex-1 overflow-hidden">
        <TabProvider>
          <ProviderAPI>
            <RoomSidebar readOnly={isViewer} />
            <div
              className="bg-background h-full flex-1"
              onDragOver={handleDragPrevent}
              onDrop={handleFileDrop}
            >
              <LinearGrid
                min={1}
                max={2}
                keyName="fileId"
                convertKeyName={convertKeyName}
                convertProcessFn={convertProcessFn}
                initialTabValue={{
                  key: getFileName(activeFileId),
                  value: {
                    fileId: activeFileId,
                    readOnly: isViewer,
                  },
                }}
              >
                {(tabKey: number) => <FileViewer tabKey={tabKey} />}
              </LinearGrid>
            </div>
            <Chat />
          </ProviderAPI>
        </TabProvider>
        <Output variant={isDark ? 'dark' : 'light'} />
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
    </div>
  );
}

interface FileViewerProps {
  tabKey: number;
}

type FileViewerTab = {
  [fileName: string]: {
    fileId: string;
    readOnly: boolean;
  };
};

function FileViewer({ tabKey }: FileViewerProps) {
  const { takeTab, removeLinear, deleteLinearTab, tabKeys } =
    useContext(LinearTabApiContext);
  const setActiveFileId = useFileStore((state) => state.setActiveFile);
  const getFileName = useFileStore((state) => state.getFileName);
  const activeTab = useTabStore((state) => state.activeTab);
  const setActiveTab = useTabStore((state) => state.setActiveTab);
  const myPtId = useRoomStore((state) => state.myPtId);
  const myPt = usePt(myPtId || '');

  const fileTab = takeTab(tabKey) as FileViewerTab;

  if (!activeTab[tabKey] || !fileTab[activeTab[tabKey]]) return <EmptyView />;

  const { fileId } = fileTab[activeTab[tabKey]];
  const readOnly = myPt?.role === ROLE.VIEWER;

  const handleDeleteTab = (fileName: string) => {
    removeLinear(tabKey, fileName);
    const nextActive = Object.keys(fileTab)[0];
    if (activeTab[tabKey] === fileName) {
      setActiveTab(
        tabKey,
        nextActive === fileName ? Object.keys(fileTab)[1] : nextActive,
      );
    }
    const deleted = takeTab(tabKey) as FileViewerTab;
    const keys = Object.keys(deleted);

    if (keys.length === 1 && tabKeys().length > 1) {
      deleteLinearTab(tabKey);
    }
  };

  const handleValueChange = (fileId: string) => {
    setActiveFileId(fileId);
    const fileName = getFileName(fileId)!;
    setActiveTab(tabKey, fileName);
  };

  return (
    <Tabs value={fileId} onValueChange={handleValueChange}>
      <ScrollArea className="overflow-x-auto">
        <TabsList variant="line">
          {Object.keys(fileTab).map((fileName) => (
            <ContextMenu key={fileName}>
              <ContextMenuTrigger>
                <TabsTrigger value={fileTab[fileName].fileId}>
                  {fileName}
                </TabsTrigger>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => handleDeleteTab(fileName)}>
                  <Trash2 color="red" />
                  삭제하기
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {Object.keys(fileTab).map((fileName) => (
        <TabsContent key={fileName} value={fileTab[fileName].fileId}>
          <CodeEditor fileId={fileTab[fileName].fileId} readOnly={readOnly} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default RoomPage;
