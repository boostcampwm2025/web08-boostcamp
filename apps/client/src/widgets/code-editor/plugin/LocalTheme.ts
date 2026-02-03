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

  return EditorView.theme({
    // Local active line color
    '&.cm-focused .cm-activeLine, .cm-activeLine': {
      backgroundColor: `${color + '15'}`,
    },

    // Active line gutter
    '&.cm-focused .cm-activeLineGutter, .cm-activeLineGutter': {
      backgroundColor: `${color + '15'}`,
    },

    // Gutter
    '.cm-gutters': {
      borderRight: 'none',
    },

    // Local selection background
    '&.cm-focused .cm-selectionBackground': {
      backgroundColor: `${color + '33'} !important`,
      color: 'inherit',
    },

    // Browser's native selection
    '& .cm-content ::selection': {
      backgroundColor: `transparent`,
      color: 'inherit',
    },
  });
};
