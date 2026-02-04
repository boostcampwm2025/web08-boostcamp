import { useChatStore } from '@/stores/chat';
import { useEffect } from 'react';

interface ShortcutHandlers {
  onNextTab?: () => void;
  onPrevTab?: () => void;
  onCloseTab?: () => void;
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

      if (!isInput && (key === '/' || (isMod && key === '/'))) {
        e.preventDefault();
        setChatOpen(!isChatOpen);
        return;
      }

      if (isAlt && key === 'w') {
        if (!isInput) {
          e.preventDefault();
          handlers?.onCloseTab?.();
          return;
        }
      }

      if (isMod && (e.code === 'ArrowDown' || e.code === 'PageDown')) {
        if (!isInput) {
          e.preventDefault();
          handlers?.onNextTab?.();
          return;
        }
      }

      if (isMod && (e.code === 'ArrowUp' || e.code === 'PageUp')) {
        if (!isInput) {
          e.preventDefault();
          handlers?.onPrevTab?.();
          return;
        }
      }

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
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isChatOpen, setChatOpen, handlers]);
}
