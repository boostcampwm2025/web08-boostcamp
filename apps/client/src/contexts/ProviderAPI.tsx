import { createContext, useContext } from 'react';
import {
  FullWidthContext,
  LinearTabContext,
  LinearTabWidthContext,
  type LinearValue,
} from './TabProvider';
import { useTabStore } from '@/stores/tab';
import { useFileStore } from '@/stores/file';

export interface TabProviderAPI {
  checkLinearWidth: () => number;
  createLinearTab: (key: string, value: LinearValue) => number;
  updateLinearTab: (tabKey: number, key: string, value: LinearValue) => void;
  deleteLinearTab: (tabKey: number) => void;
  appendLinear: (tabKey: number, key: string, value: LinearValue) => void;
  removeLinear: (tabKey: number, key: string) => void;
  resizeLinearTab: (
    targetKey: number,
    victimKey: number,
    targetDiff: number,
    victimDiff: number,
  ) => void;
  tabKeys: () => number[];
  takeTab: (tabKey: number) => { [linearKey: string]: LinearValue } | undefined;
}

export const LinearTabApiContext = createContext<TabProviderAPI>({
  checkLinearWidth: () => 0,
  appendLinear: () => {},
  updateLinearTab: () => {},
  createLinearTab: () => 0,
  deleteLinearTab: () => {},
  removeLinear: () => {},
  resizeLinearTab: () => {},
  tabKeys: () => [],
  takeTab: () => ({}),
});

type ProviderApiProps = {
  children: React.ReactNode;
};

export function ProviderAPI({ children }: ProviderApiProps) {
  const { linearTabWidth, setLinearTabWidth } = useContext(
    LinearTabWidthContext,
  );
  const { linearTab, setLinearTab } = useContext(LinearTabContext);
  const fullWidth = useContext(FullWidthContext);

  const getFileId = useFileStore((state) => state.getFileId);
  const setActiveFile = useFileStore((state) => state.setActiveFile);
  const setTabs = useTabStore((state) => state.setTabs);
  const setActiveTabKey = useTabStore((state) => state.setActiveTabKey);
  const setActiveTabContent = useTabStore((state) => state.setActiveTabContent);
  const setActiveTab = useTabStore((state) => state.setActiveTab);

  const tabs = useTabStore((state) => state.tabs);
  const activeTabKey = useTabStore((state) => state.activeTabKey);

  const checkLinearWidth = (): number => {
    if (!fullWidth) {
      return 0;
    }

    if (!linearTabWidth) {
      return fullWidth.current;
    }

    const entries = Object.entries(linearTabWidth);
    const last = entries[entries.length - 1];

    return last[1] / 2;
  };

  const createLinearTab = (key: string, value: LinearValue): number => {
    const width = checkLinearWidth();
    const now = Date.now();
    const sortTabWidth = linearTabWidth
      ? Object.fromEntries(
          Object.entries(linearTabWidth).map(([key]) => {
            return [key, width];
          }),
        )
      : {};
    const updateWidth = {
      ...sortTabWidth,
      [now]: width,
    };
    const updateTab = {
      ...linearTab,
      [now]: {
        [key]: value,
      },
    };
    const fileId = getFileId(key)!;
    setActiveFile(fileId);
    setTabs([...tabs, now.toString()]);
    setLinearTabWidth(updateWidth);
    setLinearTab(updateTab);
    setActiveTab(now, key);

    return now;
  };

  const deleteLinearTab = (tabKey: number) => {
    if (!linearTabWidth || !linearTab) {
      return;
    }

    const updateWidth = Object.fromEntries(
      Object.entries(linearTabWidth)
        .filter(([key]) => tabKey != parseInt(key))
        .map(([key, prev]) => [key, prev * 2]),
    );

    const updateTab = Object.fromEntries(
      Object.entries(linearTab).filter(([key]) => tabKey != parseInt(key)),
    );
    const keys = Object.keys(updateTab);
    setTabs(keys);
    if (tabKey == activeTabKey) {
      setActiveTabKey(parseInt(keys[0]));
      setActiveTabContent(updateTab[parseInt(keys[0])]);
    }

    setLinearTabWidth(updateWidth);
    setLinearTab(updateTab);
  };

  const appendLinear = (tabKey: number, key: string, value: LinearValue) => {
    if (!linearTab || !linearTab[tabKey]) {
      return;
    }

    const updateTab = {
      ...linearTab,
      [tabKey]: {
        ...linearTab[tabKey],
        [key]: value,
      },
    };
    const fileId = getFileId(key)!;
    setActiveFile(fileId);
    setActiveTab(tabKey, key);
    setActiveTabKey(tabKey);
    setActiveTabContent(updateTab[tabKey]);
    setLinearTab(updateTab);
  };

  const removeLinear = (tabKey: number, key: string) => {
    if (!linearTab || !linearTab[tabKey]) {
      return;
    }

    const updateTab = {
      ...linearTab,
      [tabKey]: Object.fromEntries(
        Object.entries(linearTab[tabKey]).filter(([target]) => key !== target),
      ),
    };

    setActiveTabKey(tabKey);
    setActiveTabContent(updateTab[tabKey]);
    setLinearTab(updateTab);
  };

  const resizeLinearTab = (
    targetKey: number,
    victimKey: number,
    targetDiff: number,
    victimDiff: number,
  ) => {
    if (
      !linearTabWidth ||
      !linearTabWidth[targetKey] ||
      !linearTabWidth[victimKey]
    ) {
      return;
    }

    const updateWidth = {
      ...linearTabWidth,
      [targetKey]: linearTabWidth[targetKey] + targetDiff,
      [victimKey]: linearTabWidth[victimKey] + victimDiff,
    };

    setLinearTabWidth(updateWidth);
  };

  const updateLinearTab = (tabKey: number, key: string, value: LinearValue) => {
    if (!linearTab || !linearTab[tabKey]) {
      return;
    }

    const updateTab = {
      ...linearTab,
      [tabKey]: {
        [key]: value,
      },
    };

    setActiveTabKey(tabKey);
    setActiveTabContent(updateTab[tabKey]);
    setLinearTab(updateTab);
  };

  const tabKeys = (): number[] => Object.keys(linearTabWidth ?? []).map(Number);

  const takeTab = (tabKey: number) => linearTab?.[tabKey];

  return (
    <LinearTabApiContext.Provider
      value={{
        checkLinearWidth,
        createLinearTab,
        deleteLinearTab,
        appendLinear,
        removeLinear,
        resizeLinearTab,
        updateLinearTab,
        tabKeys,
        takeTab,
      }}
    >
      {children}
    </LinearTabApiContext.Provider>
  );
}
