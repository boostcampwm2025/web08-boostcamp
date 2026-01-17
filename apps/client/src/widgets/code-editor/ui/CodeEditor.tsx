import { useEffect, useRef, useMemo } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { Compartment, EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { useYText } from '@/shared/lib/hooks/useYText';
import { yCollab } from 'y-codemirror.next';
import { safeInput } from '../plugin/SafeInput';
import { readOnlyToast } from '../plugin/ReadOnlyToast';
import { capacityLimitInputBlocker } from '../plugin/CapacityLimitInputBlocker';
import { useDarkMode } from '@/shared/lib/hooks/useDarkMode';
import { useSettings } from '@/shared/lib/hooks/useSettings';
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

  const themeCompartment = useMemo(() => new Compartment(), []);
  const fontSizeCompartment = useMemo(() => new Compartment(), []);

  const { yText, awareness } = useYText(fileId);
  const { isDark } = useDarkMode();
  const { fontSize } = useSettings();

  const setRemoteUpdateLock = useFileStore(
    (state) => state.setRemoteUpdateLock,
  );

  useEffect(() => {
    if (!editorRef.current || !yText || !awareness) return;

    const view = new EditorView({
      doc: yText.toString(),
      extensions: [
        basicSetup,
        yCollab(yText, awareness),
        getLanguageExtension(language),
        EditorState.readOnly.of(readOnly), // viewer일 때만 완전 읽기 전용
        themeCompartment.of(isDark ? oneDark : []),
        fontSizeCompartment.of(
          EditorView.theme({
            '&': { fontSize: `${fontSize}px` },
          }),
        ),
        EditorState.readOnly.of(readOnly),
        ...(readOnly ? [readOnlyToast()] : []),
        capacityLimitInputBlocker(), // 용량 제한 체크 (항상 활성화)
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

    /**
     * IME Composition Lock
     *
     * Prevents remote Y.js updates during IME composition
     * Remote doc and awareness updates are queued and flushed when composition ends.
     *
     * Idle timeout: If composition doesn't end within 30 seconds
     * force unlock to prevent indefinite queuing of remote updates.
     */
    const COMPOSITION_IDLE_TIMEOUT = 30 * 1000; // 30 seconds
    let compositionIdleTimer: number | null = null;

    // Force cancel composition by blurring
    const onCompositionTimeout: () => void = () => {
      // Clear timer
      if (compositionIdleTimer) {
        clearTimeout(compositionIdleTimer);
        compositionIdleTimer = null;
      }

      // Blur and unlock
      view.contentDOM.blur();
      setTimeout(() => view.focus(), 0);
      setRemoteUpdateLock(false);
    };

    const onCompositionStart = () => {
      setRemoteUpdateLock(true);

      // Unlock after timeout to handle stuck composition states
      compositionIdleTimer = setTimeout(
        onCompositionTimeout,
        COMPOSITION_IDLE_TIMEOUT,
      );
    };

    const onCompositionEnd = () => {
      setRemoteUpdateLock(false);

      // Clear timeout since composition ended normally
      if (compositionIdleTimer) {
        clearTimeout(compositionIdleTimer);
        compositionIdleTimer = null;
      }
    };

    const editorDOM = view.dom;
    editorDOM.addEventListener('compositionstart', onCompositionStart);
    editorDOM.addEventListener('compositionend', onCompositionEnd);

    return () => {
      editorDOM.removeEventListener('compositionstart', onCompositionStart);
      editorDOM.removeEventListener('compositionend', onCompositionEnd);

      if (compositionIdleTimer) clearTimeout(compositionIdleTimer);
      setRemoteUpdateLock(false); // Unlock on cleanup

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
    setRemoteUpdateLock,
  ]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const themeExtension = isDark ? oneDark : [];

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
