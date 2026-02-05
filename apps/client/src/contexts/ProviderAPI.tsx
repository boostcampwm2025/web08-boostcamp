import { createContext, useContext } from 'react';
import {
  ActiveTabContext,
  FullWidthContext,
  LinearTabContext,
  LinearTabWidthContext,
} from './TabProvider';
import type { LinearValue } from '@/types/tab-provider';

export interface TabProviderAPI {
  checkLinearWidth: () => number;
  createLinearTab: (tabKey: number, key: string, value: LinearValue) => number;
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
  const { activeTab, setActiveTab } = useContext(ActiveTabContext);
  const fullWidth = useContext(FullWidthContext);

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

  const createLinearTab = (
    tabKey: number,
    key: string,
    value: LinearValue,
  ): number => {
    const width = checkLinearWidth();
    const sortTabWidth = linearTabWidth
      ? Object.fromEntries(
          Object.entries(linearTabWidth).map(([key]) => {
            return [key, width];
          }),
        )
      : {};
    const updateWidth = {
      ...sortTabWidth,
      [tabKey]: width,
    };
    const updateTab = {
      ...linearTab,
      [tabKey]: {
        [key]: value,
      },
    };
    setLinearTabWidth(updateWidth);
    setLinearTab(updateTab);
    setActiveTab(tabKey, key);

    return tabKey;
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

    const entries = Object.entries(linearTab).filter(
      ([key]) => tabKey != parseInt(key),
    );
    const updateTab = Object.fromEntries(entries);
    if (tabKey == activeTab.active) {
      setActiveTab(parseInt(entries[0][0]));
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

    setActiveTab(tabKey, key);
    setLinearTab(updateTab);
  };

  const removeLinear = (tabKey: number, key: string) => {
    if (!linearTab || !linearTab[tabKey]) {
      return;
    }

    const entries = Object.entries(linearTab[tabKey]).filter(
      ([target]) => key !== target,
    );
    const updateTab = {
      ...linearTab,
      [tabKey]: Object.fromEntries(entries),
    };

    if (entries.length > 0) {
      setActiveTab(tabKey, entries[0][0]);
    }
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
        ...linearTab[tabKey],
        [key]: value,
      },
    };
    setLinearTab(updateTab);
    setActiveTab(tabKey, key);
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
