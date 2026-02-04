import { useChatStore } from '@/stores/chat';
import { useEffect } from 'react';

export function useGlobalShortcuts() {
  const { isChatOpen, setChatOpen } = useChatStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey; // Win: Ctrl, Mac: Cmd
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
  }, [isChatOpen, setChatOpen]);
}
