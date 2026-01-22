import { PROJECT_NAME } from '@codejam/common';
import LogoAnimation from '@/assets/logo_animation.svg';

export function Logo() {
  return (
    <a href="/" className="shrink-0">
      <div className="flex items-center gap-2 sm:gap-3">
        <img
          src={LogoAnimation}
          alt="CodeJam Logo"
          className="h-8 w-8 sm:h-10 sm:w-10"
        />
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground hidden sm:block">
          {PROJECT_NAME}
        </h1>
      </div>
    </a>
  );
}
