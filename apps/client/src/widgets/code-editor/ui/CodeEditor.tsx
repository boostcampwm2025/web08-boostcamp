import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { githubLight } from '@fsegurai/codemirror-theme-github-light';
import { useYText } from '@/shared/lib/hooks/useYText';
import { yCollab } from 'y-codemirror.next';
import { safeInput } from '../plugin/SafeInput';
import { readOnlyToast } from '../plugin/ReadOnlyToast';
import { capacityLimitInputBlocker } from '../plugin/CapacityLimitInputBlocker';
import { useFileStore } from '@/stores/file';

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
  const { yText, awareness } = useYText(fileId);
  const isOverLimit = useFileStore((state) => state.isOverLimit);

  useEffect(() => {
    if (!editorRef.current || !yText || !awareness) return;

    const view = new EditorView({
      doc: yText.toString(),
      extensions: [
        basicSetup,
        yCollab(yText, awareness),
        getLanguageExtension(language),
        safeInput({ allowAscii: true }),
        githubLight,
        EditorState.readOnly.of(readOnly), // viewer일 때만 완전 읽기 전용
        ...(readOnly ? [readOnlyToast()] : []),
        ...(isOverLimit ? [capacityLimitInputBlocker()] : []), // 용량 초과 시 입력만 차단
        EditorView.theme({
          '&': { height: '100%' },
          '.cm-scroller': { overflow: 'auto' },
          ...(readOnly && {
            '.cm-cursor, .cm-dropCursor': { display: 'none !important' },
            // ".cm-selectionBackground": { display: "none !important" },
            // ".cm-ySelectionCaret, .cm-ySelectionCaretDot": { display: "none !important" },
          }),
        }),
      ],
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [yText, awareness, language, readOnly, isOverLimit]); // isOverLimit 의존성 추가

  return <div ref={editorRef} className="h-full" />;
}
