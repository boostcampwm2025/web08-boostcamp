import { type ElementType, type ReactNode } from 'react';
import { AVATAR_BASE_CLASSES } from './avatar-shared';

export interface AvatarProps {
  /**
   * 렌더링할 아이콘 컴포넌트 (Lucide Icon 등)
   * 부모가 이미 어떤 아이콘을 쓸지 결정해서 넘겨줌
   */
  icon: ElementType;

  /**
   * 아바타 배경색 (HEX 색상 코드)
   */
  color: string;

  /**
   * 아바타 우측 상단에 표시될 뱃지 아이콘 (예: 👑)
   */
  badge?: ReactNode;

  /**
   * 아바타 크기 (기본값: 40px)
   */
  size?: number;

  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

/**
 * 재사용 가능한 아바타 컴포넌트
 */
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
