export interface MenuButtonProps {
  /**
   * 버튼 클릭 이벤트 핸들러
   */
  onClick?: () => void;

  /**
   * 추가 CSS 클래스
   */
  className?: string;

  /**
   * 글자 라벨
   */
  label?: string;
}

/**
 * 더보기 메뉴 버튼 컴포넌트
 *
 * @examplepnpm
 * ```tsx
 * <MenuButton onClick={() => console.log('clicked')} />
 * ```
 */
export function MenuButton({
  onClick,
  className = '',
  label = '',
}: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ${className}`}
    >
      {label}
    </button>
  );
}
