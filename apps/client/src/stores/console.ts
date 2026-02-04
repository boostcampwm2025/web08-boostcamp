import { create } from 'zustand';
import { useThemeStore } from '@/shared/lib/hooks/useDarkMode';

export const COLLAPSED_WIDTH = 5;
const DEFAULT_WIDTH = 384;

interface ConsoleState {
  width: number;
  setWidth: (width: number) => void;
  toggleConsole: () => void;
}

export const useConsoleStore = create<ConsoleState>((set) => ({
  width: DEFAULT_WIDTH,
  setWidth: (width) => set({ width }),
  toggleConsole: () => {
    // 이스터 에그 카운터 증가
    useThemeStore.getState().incrementConsoleToggle();

    set((state) => ({
      width: state.width <= COLLAPSED_WIDTH ? DEFAULT_WIDTH : COLLAPSED_WIDTH,
    }));
  },
}));
