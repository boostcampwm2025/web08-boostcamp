import { useConsoleStore, COLLAPSED_WIDTH } from '@/stores/console';
import { useState, useCallback, useEffect } from 'react';

interface UseConsolePanelResizeProps {
  minWidth: number;
  maxWidth: number;
  defaultWidth: number;
}

export function useConsolePanelResize({
  minWidth,
  maxWidth,
}: UseConsolePanelResizeProps) {
  const { width, setWidth } = useConsoleStore();
  const [isResizing, setIsResizing] = useState(false);
  const isCollapsed = width === COLLAPSED_WIDTH;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth < minWidth) {
        setWidth(COLLAPSED_WIDTH);
      } else {
        const clampedWidth = Math.min(maxWidth, Math.max(minWidth, newWidth));
        setWidth(clampedWidth);
      }
    };

    const handleMouseUp = () => setIsResizing(false);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minWidth, maxWidth, setWidth]);

  return { width, isResizing, isCollapsed, handleMouseDown };
}
