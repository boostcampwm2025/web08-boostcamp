import { useEffect, useRef, useMemo } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { Compartment, EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { githubLight } from '@fsegurai/codemirror-theme-github-light';
import { oneDark } from '@codemirror/theme-one-dark';
import { useYText } from '@/shared/lib/hooks/useYText';
import { yCollab } from 'y-codemirror.next';
import { safeInput } from '../plugin/SafeInput';
import { readOnlyToast } from '../plugin/ReadOnlyToast';
import { useDarkMode } from '@/shared/lib/hooks/useDarkMode';
import { useSettings } from '@/shared/lib/hooks/useSettings';

type Language = 'javascript' | 'html' | 'css';

interface CodeEditorProps {
  fileId?: string;
  language?: Language;
  readOnly?: boolean;
}

const getLanguageExtension = (language: Language) => {
  switch (language) {
    case 'javascript':
      return javascript({ jsx: true, typescript: true });
    case 'html':
      return html();
    case 'css':
      return css();
    default:
      return javascript({ jsx: true, typescript: true });
  }
};

export default function CodeEditor({
  fileId = 'prototype',
  language = 'javascript',
  readOnly = false,
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const themeCompartment = useMemo(() => new Compartment(), []);
  const fontSizeCompartment = useMemo(() => new Compartment(), []);

  const { yText, awareness } = useYText(fileId);
  const { isDark } = useDarkMode();
  const { fontSize } = useSettings();

  useEffect(() => {
    if (!editorRef.current || !yText || !awareness) return;

    const initialTheme = isDark ? oneDark : githubLight;

    const view = new EditorView({
      doc: yText.toString(),
      extensions: [
        basicSetup,
        yCollab(yText, awareness),
        getLanguageExtension(language),
        safeInput({ allowAscii: true }),
        themeCompartment.of(initialTheme),
        fontSizeCompartment.of(
          EditorView.theme({
            '&': { fontSize: `${fontSize}px` },
          }),
        ),
        EditorState.readOnly.of(readOnly),
        ...(readOnly ? [readOnlyToast()] : []),
        EditorView.theme({
          '&': { height: '100%' },
          '.cm-scroller': { overflow: 'auto' },
          ...(readOnly && {
            '.cm-cursor, .cm-dropCursor': { display: 'none !important' },
          }),
        }),
      ],
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [
    yText,
    awareness,
    language,
    readOnly,
    themeCompartment,
    fontSizeCompartment,
    fontSize,
    isDark,
  ]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const themeExtension = isDark ? oneDark : githubLight;

    view.dispatch({
      effects: themeCompartment.reconfigure(themeExtension),
    });
  }, [isDark, themeCompartment]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch({
      effects: fontSizeCompartment.reconfigure(
        EditorView.theme({
          '&': { fontSize: `${fontSize}px` },
        }),
      ),
    });
  }, [fontSize, fontSizeCompartment]);

  return <div ref={editorRef} className="h-full" />;
}
