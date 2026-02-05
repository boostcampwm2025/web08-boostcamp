import LogoAnimation from '@/assets/logo_animation.svg?react';
import { Link } from 'react-router-dom';

export function Logo() {
  return (
    <Link to="/" className="shrink-0">
      <LogoAnimation
        aria-label="CodeJam Logo"
        className="h-8 w-8 sm:h-10 sm:w-10"
      />
    </Link>
  );
}
