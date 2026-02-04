import { useChatStore } from '@/stores/chat';
import { useEffect } from 'react';

interface ShortcutHandlers {
  onNextTab?: () => void;
  onPrevTab?: () => void;
  onNextSidebarTab?: () => void;
  onPrevSidebarTab?: () => void;
  onCloseTab?: () => void;
  onToggleSidebar?: () => void;
  onToggleOutput?: () => void;
}

export function useGlobalShortcuts(handlers?: ShortcutHandlers) {
  const { isChatOpen, setChatOpen } = useChatStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey; // Win: Ctrl, Mac: Cmd
      const isAlt = e.altKey;
      const key = e.key.toLowerCase();

      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (key === 'escape') {
        if (isInput) {
          target.blur();
          e.preventDefault();
          return;
        }

        if (isChatOpen) {
          setChatOpen(false);
          e.preventDefault();
          return;
        }
      }

      if (isInput) return;

      // Sidebar
      if (isMod && key === 'b') {
        e.preventDefault();
        handlers?.onToggleSidebar?.();
      }

      if (isMod && (e.code === 'ArrowDown' || e.code === 'PageDown')) {
        e.preventDefault();
        handlers?.onNextSidebarTab?.();
        return;
      }
      if (isMod && (e.code === 'ArrowUp' || e.code === 'PageUp')) {
        e.preventDefault();
        handlers?.onPrevSidebarTab?.();
        return;
      }

      // Output
      if (isMod && key === 'j') {
        e.preventDefault();
        handlers?.onToggleOutput?.();
      }

      // Tab
      if (isAlt && key === 'w') {
        e.preventDefault();
        handlers?.onCloseTab?.();
        return;
      }

      if (isMod && e.code === 'ArrowRight') {
        e.preventDefault();
        handlers?.onNextTab?.();
        return;
      }
      if (isMod && e.code === 'ArrowLeft') {
        e.preventDefault();
        handlers?.onPrevTab?.();
        return;
      }

      // Chat
      if (!isInput && (key === '/' || (isMod && key === '/'))) {
        e.preventDefault();
        setChatOpen(!isChatOpen);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isChatOpen, setChatOpen, handlers]);
}
