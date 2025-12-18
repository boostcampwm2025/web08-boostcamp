import { PROJECT_NAME } from '@codejam/common';
import { useState } from 'react';
import LogoAnimation from '@/assets/logo_animation.svg';

export default function Header() {
  const [isDark, setIsDark] = useState(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="h-14 bg-background border-b border-border flex items-center px-4">
      {/* 로고 및 서비스명 */}
      <a href="/">
        <div className="flex items-center gap-3">
          <img src={LogoAnimation} alt="CodeJam Logo" className="h-10 w-10" />
          <h1 className="text-2xl font-semibold text-foreground">
            {PROJECT_NAME}
          </h1>
        </div>
      </a>
      <button
        onClick={toggleDarkMode}
        className="ml-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
      >
        {isDark ? '☀️ Light' : '🌙 Dark'}
      </button>
    </header>
  );
}
