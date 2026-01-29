import type { LinearValue } from '@/contexts/TabProvider';
import { create } from 'zustand';

type TabContent = { [key: string]: LinearValue };
interface TabState {
  tabs: string[];
  activeTabKey: number;
  activeTabContent: TabContent;
  activeTab: { [key: number]: string };

  setTabs: (tabKeys: string[]) => void;
  setActiveTabKey: (activeTabKey: number) => void;
  setActiveTabContent: (content: TabContent) => void;
  setActiveTab: (key: number, activeTab: string) => void;
}

export const useTabStore = create<TabState>((set, get) => ({
  tabs: [],
  activeTabKey: 0,
  activeTabContent: {},
  activeTab: {},

  setTabs: (tabKeys: string[]) => set({ tabs: tabKeys }),
  setActiveTabKey: (activeTabKey: number) => set({ activeTabKey }),
  setActiveTabContent: (content: TabContent) =>
    set({ activeTabContent: content }),
  setActiveTab: (key: number, activeTab: string) =>
    set({ activeTab: { ...get().activeTab, [key]: activeTab } }),
}));
