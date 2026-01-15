import { type ReactNode } from 'react';

export interface AvatarProps {
  /**
   * 아바타 내부에 표시될 텍스트 (주로 닉네임 첫 글자)
   */
  initial: string;

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
  initial,
  color,
  badge,
  size = 40,
  className = '',
}: AvatarProps) {
  return (
    <div
      className={`relative rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className="w-full h-full rounded-full
          flex items-center justify-center text-white text-lg font-semibold"
        style={{ backgroundColor: color }}
      >
        {initial}
      </div>
      {badge && (
        <span className="absolute -top-2 -right-1 text-s">{badge}</span>
      )}
    </div>
  );
}
