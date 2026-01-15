import { useState, useEffect } from 'react';

const STORAGE_KEY = 'theme-mode';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    // 로컬스토리지에서 설정 가져오기
    const storedTheme = localStorage.getItem(STORAGE_KEY);

    if (storedTheme !== null) {
      return storedTheme === 'dark';
    }

    // 저장된 설정이 없으면 시스템 설정 확인
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 로컬스토리지에 설정 저장
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return { isDark, toggleTheme };
}
