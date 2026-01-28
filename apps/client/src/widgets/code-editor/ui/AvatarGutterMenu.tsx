import { useEffect, useRef } from 'react';
import { type AvatarUser } from '../plugin/LineAvatars';
import { createPortal } from 'react-dom';
import { createAvatarGenerator, LucideAvatarProvider } from '@codejam/ui';

const provider = new LucideAvatarProvider();
const { Avatar } = createAvatarGenerator(provider);

interface Props {
  isOpen: boolean;
  position: { x: number; y: number } | null;
  users: AvatarUser[];
  onClose: () => void;
}

export function AvatarGutterMenu({ isOpen, position, users, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen || !position) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="animate-in fade-in zoom-in-95 fixed z-50 flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-xl duration-100 dark:border-gray-700 dark:bg-gray-800"
      style={{
        left: position.x + 15, // 클릭 위치보다 약간 오른쪽
        top: position.y - 10, // 클릭 위치보다 약간 위
      }}
    >
      <div className="mb-1 px-1 text-xs font-semibold text-gray-500">
        Currently Editing ({users.length})
      </div>
      <div className="flex max-w-[200px] flex-wrap gap-2">
        {users.map((user) => (
          <div
            key={user.hash}
            className="flex items-center gap-2 rounded p-1 pr-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Avatar id={user.hash} color={user.color} size={20} />
            <span className="max-w-[100px] truncate text-sm text-gray-800 dark:text-gray-200">
              {user.name || 'Anonymous'}
            </span>
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
}
