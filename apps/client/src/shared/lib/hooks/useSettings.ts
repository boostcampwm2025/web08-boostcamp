import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
  fontSize: number;
  setFontSize: (size: number) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      fontSize: 14, // 기본 폰트 사이즈
      setFontSize: (size) => set({ fontSize: size }),
      resetSettings: () => set({ fontSize: 14 }),
    }),
    {
      name: 'editor-settings',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function useSettings() {
  const { fontSize, setFontSize, resetSettings } = useSettingsStore();
  return { fontSize, setFontSize, resetSettings };
}
