import { create } from 'zustand';
import type { EditorView } from 'codemirror';

interface EditorStore {
  editorView: EditorView | null;
  setEditorView: (view: EditorView | null) => void;
  focusEditor: () => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  editorView: null,
  setEditorView: (view) => set({ editorView: view }),
  focusEditor: () => {
    const view = get().editorView;
    if (view) {
      view.focus();
    }
  },
}));
