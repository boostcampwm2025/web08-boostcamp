/**
 * 더보기 메뉴 버튼 컴포넌트
 *
 * @examplepnpm
 * ```tsx
 * <MenuButton onClick={() => console.log('clicked')} />
 * ```
 */
export function ThreeDot() {
  return (
    <svg
      width="16px"
      height="16px"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className="bi bi-three-dots"
    >
      <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
    </svg>
  );
}
