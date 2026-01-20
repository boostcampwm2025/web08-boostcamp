import { ViewPlugin, ViewUpdate } from '@codemirror/view';

/**
 * Composition Tracker Plugin
 *
 * Tracks IME composition using CodeMirror's view.composing property.
 *
 * Features:
 * - Locks remote updates during composition
 * - Unlocks when composition ends
 * - Idle timeout protection to prevent indefinite locking
 */
export const compositionTracker = (
  setRemoteUpdateLock: (locked: boolean) => void,
) => {
  const COMPOSITION_IDLE_TIMEOUT = 60 * 1000; // 1 minute

  return ViewPlugin.define((view) => {
    let compositionIdleTimer: number | null = null;
    let wasComposing = false;

    const update = (update: ViewUpdate) => {
      const isComposing = update.view.composing;

      // Detect composition start
      if (isComposing && !wasComposing) {
        startCompositionLock();
      }

      // Detect composition end
      if (!isComposing && wasComposing) {
        endCompositionLock();
      }

      wasComposing = isComposing;
    };

    const destroy = () => {
      // Clean up
      if (compositionIdleTimer) {
        clearTimeout(compositionIdleTimer);
      }

      // Released lock on destroy
      setRemoteUpdateLock(false);
    };

    const startCompositionLock = () => {
      setRemoteUpdateLock(true);
      console.log('[Composition] Started');

      // Start idle timeout
      compositionIdleTimer = setTimeout(forceUnlock, COMPOSITION_IDLE_TIMEOUT);
    };

    const endCompositionLock = () => {
      // Deferred update
      setTimeout(() => setRemoteUpdateLock(false), 0);
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

    return { update, destroy };
  });
};
