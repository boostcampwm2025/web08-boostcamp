import { LinearTabApiContext } from '@/contexts/ProviderAPI';
import { useFileStore } from '@/stores/file';
import { lazy, Suspense, useContext, useEffect, type MouseEvent } from 'react';
import { EmptyView } from './EmptyView';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ScrollArea,
  ScrollBar,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@codejam/ui';
import { Trash2 } from 'lucide-react';
import { ActiveTabContext } from '@/contexts/TabProvider';

type TabViewerProps = {
  tabKey: number;
  readOnly: boolean;
};

type FileViewerTab = {
  [fileId: string]: {
    fileName: string;
  };
};

const FileContentViewer = lazy(() => import('./FileContentViewer'));

export default function TabViewer({ tabKey, readOnly }: TabViewerProps) {
  const { takeTab, removeLinear, deleteLinearTab, tabKeys } =
    useContext(LinearTabApiContext);
  const { activeTab, setActiveTab } = useContext(ActiveTabContext);
  const setActiveFileId = useFileStore((state) => state.setActiveFile);
  const getFileName = useFileStore((state) => state.getFileName);

  const fileTab = takeTab(tabKey) as FileViewerTab;

  useEffect(() => {
    const updated = takeTab(tabKey) as FileViewerTab;
    const keys = Object.keys(updated);
    if (keys.length > 0) {
      setActiveFileId(activeTab[activeTab.active]);
    }
  }, [activeTab]);

  const handleDeleteTab = (fileId: string) => {
    removeLinear(tabKey, fileId);
    const deleted = takeTab(tabKey) as FileViewerTab;
    const keys = Object.keys(deleted);

    if (keys.length === 1 && tabKeys().length > 1) {
      deleteLinearTab(tabKey);
      return;
    }

    if (keys.length === 1 && tabKeys().length === 1) {
      setActiveFileId(null);
      return;
    }
  };

  const handleValueChange = (fileId: string) => {
    setActiveTab(tabKey, fileId);
  };

  const myTabs = Object.keys(fileTab);

  return (
    <Tabs value={activeTab[tabKey]} onValueChange={handleValueChange}>
      <ScrollArea className="overflow-x-auto">
        <TabsList variant="line">
          {myTabs.map((fileId) => (
            <ContextMenu key={fileId}>
              <ContextMenuTrigger>
                <TabsTrigger value={fileId}>
                  {getFileName(fileId) ? (
                    getFileName(fileId)
                  ) : (
                    <span className="text-red-400 italic line-through">
                      {fileTab[fileId].fileName}
                    </span>
                  )}
                </TabsTrigger>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  onClick={(e: MouseEvent) => {
                    e.stopPropagation();
                    handleDeleteTab(fileId);
                  }}
                >
                  <Trash2 color="red" />
                  삭제하기
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {myTabs.length > 0 ? (
        myTabs.map((fileId) => (
          <TabsContent key={fileId} value={fileId}>
            {activeTab[tabKey] == fileId ? (
              getFileName(fileId) ? (
                <Suspense fallback={null}>
                  <FileContentViewer fileId={fileId} readOnly={readOnly} />
                </Suspense>
              ) : (
                <EmptyView />
              )
            ) : null}
          </TabsContent>
        ))
      ) : (
        <EmptyView />
      )}
    </Tabs>
  );
}
