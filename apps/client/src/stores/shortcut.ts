import { create } from 'zustand';

interface ShortcutStore {
  isHUDOpen: boolean;
  setHUDOpen: (isOpen: boolean) => void;
}

export const useShortcutStore = create<ShortcutStore>((set) => ({
  isHUDOpen: false,
  setHUDOpen: (isHUDOpen) => set({ isHUDOpen }),
}));
