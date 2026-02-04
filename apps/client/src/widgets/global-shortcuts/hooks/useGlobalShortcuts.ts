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
  onToggleSplit?: () => void; // 화면 분할 토글
  onFocusSplit?: (index: number) => void; // 특정 스플릿 포커스
  onShortcutHold?: (holding: boolean) => void;
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
      if (isMod && (key === 'j' || key === '`')) {
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

      // Split View Control
      if (isMod && key === '\\') {
        e.preventDefault();
        handlers?.onToggleSplit?.();
      }
      if (isMod && (key === '1' || key === '2')) {
        e.preventDefault();
        handlers?.onFocusSplit?.(parseInt(key) - 1);
      }

      // Chat
      if (!isInput && (key === '/' || (isMod && key === '/'))) {
        e.preventDefault();
        setChatOpen(!isChatOpen);
        return;
      }

      // Show Shortcuts
      if (isMod && e.shiftKey && key === 'p') {
        e.preventDefault();
        handlers?.onShortcutHold?.(true);
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (
        key === 'p' ||
        e.key === 'Control' ||
        e.key === 'Shift' ||
        e.key === 'Meta'
      ) {
        handlers?.onShortcutHold?.(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [isChatOpen, setChatOpen, handlers]);
}
