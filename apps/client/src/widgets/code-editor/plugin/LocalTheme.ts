import { EditorView } from 'codemirror';

export interface LocalUser {
  color?: string;
  name?: string;
}

/**
 * Creates a local user theme for CodeMirror
 * Matches y-codemirror's color scheme for consistency
 *
 * @param user - User object with color and optional colorLight
 */
export const localTheme = (user?: LocalUser) => {
  // Match y-codemirror's color logic
  const color = user?.color || '#30bced';
  const alpha = `33`;
  const colorLight = color + alpha;

  return EditorView.theme({
    // Local selection background
    '&.cm-focused .cm-selectionBackground': {
      backgroundColor: `${colorLight} !important`,
      color: 'inherit',
    },

    // Browser's native selection
    '& .cm-content ::selection': {
      backgroundColor: `transparent`,
      color: 'inherit',
    },
  });
};
