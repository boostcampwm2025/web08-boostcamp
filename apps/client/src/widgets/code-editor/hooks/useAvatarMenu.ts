import { useState, useCallback } from 'react';
import { type AvatarUser } from '../plugin/LineAvatars';

export function useAvatarMenu() {
  const [menuState, setMenuState] = useState<{
    isOpen: boolean;
    position: { x: number; y: number } | null;
    users: AvatarUser[];
  }>({
    isOpen: false,
    position: null,
    users: [],
  });

  const handleGutterClick = useCallback(
    ({ event, users }: { event: MouseEvent; users: AvatarUser[] }) => {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setMenuState({
        isOpen: true,
        position: { x: rect.right, y: rect.top },
        users,
      });
    },
    [],
  );

  const closeMenu = useCallback(() => {
    setMenuState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return { menuState, handleGutterClick, closeMenu };
}
