export interface MenuButtonProps {
  onClick?: () => void;
  className?: string;
  label?: string;
}

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
