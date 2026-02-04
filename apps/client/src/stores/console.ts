import { create } from 'zustand';

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
  toggleConsole: () =>
    set((state) => ({
      width: state.width <= COLLAPSED_WIDTH ? DEFAULT_WIDTH : COLLAPSED_WIDTH,
    })),
}));
