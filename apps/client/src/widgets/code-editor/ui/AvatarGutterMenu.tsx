import { useEffect, useRef } from 'react';
import { type AvatarUser } from '../plugin/LineAvatars'; // 타입 import
import { createPortal } from 'react-dom';
import { getAvatarIcon } from '@/shared/ui/avatar-shared';
import { Avatar } from '@/shared/ui';

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
      className="fixed z-50 flex flex-col gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-100"
      style={{
        left: position.x + 15, // 클릭 위치보다 약간 오른쪽
        top: position.y - 10, // 클릭 위치보다 약간 위
      }}
    >
      <div className="text-xs font-semibold text-gray-500 px-1 mb-1">
        Currently Editing ({users.length})
      </div>
      <div className="flex flex-wrap gap-2 max-w-[200px]">
        {users.map((user) => (
          <div
            key={user.hash}
            className="flex items-center gap-2 p-1 pr-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Avatar
              icon={getAvatarIcon(user.hash)}
              color={user.color}
              size={20}
            />
            <span className="text-sm truncate max-w-[100px] text-gray-800 dark:text-gray-200">
              {user.name || 'Anonymous'}
            </span>
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
}
