import { Sun, Moon } from 'lucide-react';
import { useDarkMode } from '@/shared/lib/hooks/useDarkMode';
import { HeaderActionButton } from './HeaderActionButton';

export function ThemeToggleButton() {
  const { isDark, toggleTheme } = useDarkMode();

  return (
    <HeaderActionButton onClick={toggleTheme}>
      {isDark ? (
        <>
          <Sun className="h-4 w-4" />
          <span className="hidden lg:inline">Light</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span className="hidden lg:inline">Dark</span>
        </>
      )}
    </HeaderActionButton>
  );
}
