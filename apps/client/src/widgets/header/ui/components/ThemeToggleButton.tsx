import { Sun, Moon } from 'lucide-react';
import { useDarkMode } from '@/shared/lib/hooks/useDarkMode';
import { Button } from '@codejam/ui';

export function ThemeToggleButton() {
  const { isDark, toggleTheme } = useDarkMode();

  return (
    <Button
      size="icon-sm"
      variant="ghost"
      onClick={toggleTheme}
      title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}
