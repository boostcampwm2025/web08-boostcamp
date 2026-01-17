import { ViewPlugin } from '@codemirror/view';

/**
 * Composition Tracker Plugin
 *
 * Tracks IME composition using DOM events.
 *
 * Features:
 * - Locks remote updates during composition
 * - Unlocks when composition ends
 * - Idle timeout protection to prevent indefinite locking
 */
export const compositionTracker = (
  setRemoteUpdateLock: (locked: boolean) => void,
) => {
  const COMPOSITION_IDLE_TIMEOUT = 30 * 1000; // 30 seconds

  return ViewPlugin.define((view) => {
    let compositionIdleTimer: number | null = null;

    const onCompositionStart = () => {
      // Lock remote updates
      setRemoteUpdateLock(true);
      console.log('[Composition] Started');

      // Start idle timeout
      compositionIdleTimer = setTimeout(forceUnlock, COMPOSITION_IDLE_TIMEOUT);
    };

    const onCompositionEnd = () => {
      // Unlock remote updates
      setRemoteUpdateLock(false);
      console.log('[Composition] Ended');

      // Clear timeout
      if (compositionIdleTimer) {
        clearTimeout(compositionIdleTimer);
        compositionIdleTimer = null;
      }
    };

    const forceUnlock = () => {
      // Clear timeout
      if (compositionIdleTimer) {
        clearTimeout(compositionIdleTimer);
        compositionIdleTimer = null;
      }

      // Force cancel composition by blurring and refocusing
      view.contentDOM.blur();
      setTimeout(() => view.focus(), 0);

      setRemoteUpdateLock(false);
      console.log('[Composition] Force unlocked after timeout');
    };

    // Register DOM event listeners

    view.dom.addEventListener('compositionstart', onCompositionStart);
    view.dom.addEventListener('compositionend', onCompositionEnd);

    const destroy = () => {
      // Remove event listeners
      view.dom.removeEventListener('compositionstart', onCompositionStart);
      view.dom.removeEventListener('compositionend', onCompositionEnd);

      // Clean up
      if (compositionIdleTimer) {
        clearTimeout(compositionIdleTimer);
      }

      // Released lock on destroy
      setRemoteUpdateLock(false);
    };

    return { destroy };
  });
};
