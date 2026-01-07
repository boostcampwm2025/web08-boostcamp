export interface MenuButtonProps {
  /**
   * 버튼 클릭 이벤트 핸들러
   */
  onClick?: () => void;

  /**
   * 추가 CSS 클래스
   */
  className?: string;
}

/**
 * 더보기 메뉴 버튼 컴포넌트
 *
 * @example
 * ```tsx
 * <MenuButton onClick={() => console.log('clicked')} />
 * ```
 */
export function MenuButton({ onClick, className = "" }: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 ${className}`}
    >
      {/* TODO: SVG for more-vertical icon */}
    </button>
  );
}
