import { useEffect } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false, // 초기값
      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
    }),
    {
      name: 'theme-mode',
      storage: createJSONStorage(() => localStorage),
      // skipHydration: true,
    },
  ),
);

export function useDarkMode() {
  const { isDark, toggleTheme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return { isDark, toggleTheme };
}
