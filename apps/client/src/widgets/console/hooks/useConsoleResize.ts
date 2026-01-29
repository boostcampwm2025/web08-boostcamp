import { useState, useCallback, useEffect } from 'react';

const COLLAPSED_WIDTH = 5;

interface UseConsoleResizeProps {
  minWidth: number;
  maxWidth: number;
  defaultWidth: number;
}

interface UseConsoleResizeReturn {
  width: number;
  isResizing: boolean;
  isCollapsed: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleExpand: () => void;
}

export function useConsoleResize({
  minWidth,
  maxWidth,
  defaultWidth,
}: UseConsoleResizeProps): UseConsoleResizeReturn {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const isCollapsed = width === COLLAPSED_WIDTH;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleExpand = useCallback(() => {
    setWidth(defaultWidth);
  }, [defaultWidth]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;

      // If dragged below min width, collapse it
      if (newWidth < minWidth) {
        setWidth(COLLAPSED_WIDTH);
      } else {
        const clampedWidth = Math.min(maxWidth, Math.max(minWidth, newWidth));
        setWidth(clampedWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minWidth, maxWidth]);

  return {
    width,
    isResizing,
    isCollapsed,
    handleMouseDown,
    handleExpand,
  };
}
