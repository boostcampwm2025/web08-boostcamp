import { EditorView } from '@codemirror/view';
import { type Extension, StateField, StateEffect } from '@codemirror/state';

/**
 * CompositionTracker Plugin
 *
 * Handles IME composition conflicts in collaborative editing.
 * During composition, buffers remote Y.js updates at the Y.Doc level
 * to prevent DOM updates that would destroy the browser's composition text node.
 * Flushes buffered updates when composition ends
 */

/**
 * Composition idle timeout
 * force flush if user abandons composition
 */
const COMPOSITION_IDLE_TIMEOUT = 5000; // 5 seconds

interface CompositionState {
  composing: boolean;
  compositionStart: number | null;
}

/**
 * Callbacks for composition lifecycle events
 */
export interface CompositionCallbacks {
  onCompositionStart?: () => void;
  onCompositionEnd?: () => void;
}

// Effect to update composition state
const setCompositionState = StateEffect.define<CompositionState>();

// StateField to track composition status
const compositionStateField = StateField.define<CompositionState>({
  create: () => ({
    composing: false,
    compositionStart: null,
  }),
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setCompositionState)) {
        return effect.value;
      }
    }
    return value;
  },
});

/**
 * Creates a composition tracker extension for CodeMirror.
 * Buffers remote Y.js updates during IME composition to prevent
 * DOM updates that would destroy the browser's composition state.
 */
export function compositionTracker(
  callbacks?: CompositionCallbacks,
): Extension {
  // rAF handle to delay onCompositionEnd
  // Checks if user starts composing again (Korean IME)
  let frame: number | null = null;

  // Idle timeout handle
  // Prevents infinite buffering if composition abandoned
  let timer: number | null = null;

  const startIdleTimer = (view: EditorView) => {
    clearIdleTimer();

    timer = window.setTimeout(() => {
      // Reset timer
      timer = null;

      // Force composition to end by blurring and refocusing
      view.contentDOM.blur();
      view.contentDOM.focus();

      // Mark composition as ended
      const effects = setCompositionState.of({
        composing: false,
        compositionStart: null,
      });
      view.dispatch({ effects });

      // Flush buffered updates
      callbacks?.onCompositionEnd?.();
    }, COMPOSITION_IDLE_TIMEOUT);
  };

  const clearIdleTimer = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return [
    compositionStateField,

    EditorView.domEventHandlers({
      // Composition starts
      compositionstart(_event, view) {
        const position = view.state.selection.main.from;

        // Cancel frame if exist
        if (frame) {
          cancelAnimationFrame(frame);
          frame = null;
        }

        // Start idle timeout
        startIdleTimer(view);

        // Call start callback
        callbacks?.onCompositionStart?.();

        // Update state
        const effects = setCompositionState.of({
          composing: true,
          compositionStart: position,
        });

        view.dispatch({ effects });
        return false;
      },

      // Composition updates
      compositionupdate(_event, view) {
        const state = view.state.field(compositionStateField);

        // Reset idle timer on activity
        if (state.composing) {
          startIdleTimer(view);
          return false;
        }

        // Fallback: compositionstart was missed - treat as start
        startIdleTimer(view);
        callbacks?.onCompositionStart?.();

        const effects = setCompositionState.of({
          composing: true,
          compositionStart: view.state.selection.main.from,
        });

        view.dispatch({ effects });
        return false;
      },

      // Composition ends
      compositionend(_event, view) {
        // Clear idle timer
        clearIdleTimer();

        // Mark composition as ended in state
        const effects = setCompositionState.of({
          composing: false,
          compositionStart: null,
        });

        view.dispatch({ effects });

        // Schedule flush for next frame
        // This handles Korean IME where compositionstart fires immediately
        frame = requestAnimationFrame(() => {
          frame = null;

          // Check if user started composing again
          if (view.composing) return;
          callbacks?.onCompositionEnd?.();
        });

        return false;
      },
    }),
  ];
}

/**
 * Helper function to check if editor is currently composing
 */
export function isComposing(view: EditorView): boolean {
  const state = view.state.field(compositionStateField);
  return view.composing || state.composing;
}
