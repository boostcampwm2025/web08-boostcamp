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
  let frame: number | null = null;

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

        // Call start callback
        callbacks?.onCompositionStart?.();

        // Update state
        const effects = setCompositionState.of({
          composing: true,
          compositionStart: position,
        });

        view.dispatch({ effects });

        console.log('[CompositionTracker] Composition started at:', position);
        return false;
      },

      // Composition updates
      compositionupdate(_event, view) {
        const state = view.state.field(compositionStateField);
        if (state.composing) return false;

        // Fallback: compositionstart was missed. Treat as start
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
        console.log('[CompositionTracker] Composition ended');

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

          console.log('[CompositionTracker] Composition ended - safe to flush');
          callbacks?.onCompositionEnd?.();
        });

        return false;
      },
    }),
  ];
}
