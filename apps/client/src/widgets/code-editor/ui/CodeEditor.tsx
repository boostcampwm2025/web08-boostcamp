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
import {
  lineAvatarExtension,
  type LineToUsersMap,
} from '../plugin/LineAvatars';
import * as Y from 'yjs';

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
  const avatarCompartment = useMemo(() => new Compartment(), []);

  const { yText, awareness } = useYText(fileId);
  const { isDark } = useDarkMode();
  const { fontSize } = useSettings();

  useEffect(() => {
    if (!editorRef.current || !yText || !awareness) return;

    const view = new EditorView({
      doc: yText.toString(),
      extensions: [
        basicSetup,
        yCollab(yText, awareness),
        getLanguageExtension(language),
        safeInput({ allowAscii: true }),
        EditorState.readOnly.of(readOnly), // viewer일 때만 완전 읽기 전용
        themeCompartment.of(isDark ? oneDark : []),
        fontSizeCompartment.of(
          EditorView.theme({
            '&': { fontSize: `${fontSize}px` },
          }),
        ),
        avatarCompartment.of(lineAvatarExtension(new Map())),
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
    avatarCompartment,
  ]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || !awareness || !yText?.doc) return;

    let debounceTimer: ReturnType<typeof setTimeout>;

    const handleAwarenessChange = () => {
      if (debounceTimer) clearTimeout(debounceTimer);

      debounceTimer = setTimeout(() => {
        const currentView = viewRef.current;
        if (!currentView) return;

        const states = awareness.getStates();
        const newLineToUsersMap: LineToUsersMap = new Map();

        states.forEach((state, clientID) => {
          if (clientID === awareness.clientID) return;

          const cursor = state.cursor;
          const user = (state.user as any) || {};
          if (!user.hash || !cursor) return;

          const userFileId = user.currentFileId;
          if (userFileId && userFileId !== fileId) return;

          let absIndex: number | null = null;
          const relPos = cursor.head || cursor.anchor;

          if (relPos) {
            try {
              const absolutePosition =
                Y.createAbsolutePositionFromRelativePosition(
                  relPos,
                  yText.doc!,
                );
              if (absolutePosition) {
                absIndex = absolutePosition.index;
              }
            } catch (error) {
              console.warn('Pos calc error:', error);
            }
          }

          if (absIndex !== null) {
            const docLength = currentView.state.doc.length;
            const pos = Math.min(Math.max(0, absIndex), docLength);
            const line = currentView.state.doc.lineAt(pos);

            const existing = newLineToUsersMap.get(line.number) || [];

            if (!existing.some((u) => u.hash === user.hash)) {
              newLineToUsersMap.set(line.number, [...existing, user]);
            }

            currentView.dispatch({
              effects: avatarCompartment.reconfigure(
                lineAvatarExtension(newLineToUsersMap),
              ),
            });
          }
        });
      }, 50);
    };

    handleAwarenessChange();
    awareness.on('change', handleAwarenessChange);
    awareness.on('update', handleAwarenessChange);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      awareness.off('change', handleAwarenessChange);
      awareness.off('update', handleAwarenessChange);
    };
  }, [awareness, avatarCompartment, yText]);

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
