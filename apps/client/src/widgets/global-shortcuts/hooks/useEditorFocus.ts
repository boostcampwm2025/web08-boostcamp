import { useEditorStore } from '@/stores/editor';

export function useEditorFocus() {
  const focusEditor = useEditorStore((state) => state.focusEditor);

  const handleFocusEditor = () => {
    focusEditor();
  };

  return { handleFocusEditor };
}
