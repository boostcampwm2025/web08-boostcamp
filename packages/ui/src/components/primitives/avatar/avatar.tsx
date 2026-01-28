import { type ElementType, type ReactNode } from 'react';
import { AVATAR_BASE_CLASSES } from './avatar-shared';

export interface AvatarProps {
  icon: ElementType;
  color: string;
  badge?: ReactNode;
  size?: number;
  className?: string;
}

export function Avatar({
  icon: Icon,
  color,
  badge,
  size = 40,
  className = '',
}: AvatarProps) {
  const iconSize = Math.floor(size * 0.6);

  return (
    <div
      className={`${AVATAR_BASE_CLASSES} ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className="flex h-full w-full items-center justify-center rounded-full text-white shadow-sm transition-transform hover:scale-105"
        style={{ backgroundColor: color }}
      >
        <Icon size={iconSize} strokeWidth={2.5} />
      </div>
      {badge && (
        <span className="text-s absolute -top-2 -right-1">{badge}</span>
      )}
    </div>
  );
}
