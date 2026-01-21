import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
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
import { lineAvatarExtension, type AvatarUser } from '../plugin/LineAvatars';
import { useLineAvatars } from '@/widgets/code-editor/hooks/useLineAvatars';
import { AvatarGutterMenu } from './AvatarGutterMenu';

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

  const lineToUsersMap = useLineAvatars(
    awareness ?? undefined,
    yText ?? undefined,
    fileId,
    viewRef.current,
  );

  const [menuState, setMenuState] = useState<{
    isOpen: boolean;
    position: { x: number; y: number } | null;
    users: AvatarUser[];
  }>({
    isOpen: false,
    position: null,
    users: [],
  });

  const handleGutterClick = useCallback(
    ({ event, users }: { event: MouseEvent; users: AvatarUser[] }) => {
      const rect = (event.target as HTMLElement).getBoundingClientRect();

      setMenuState({
        isOpen: true,
        position: { x: rect.right, y: rect.top }, // Gutter 바로 오른쪽에 표시
        users,
      });
    },
    [],
  );

  useEffect(() => {
    if (!editorRef.current || !yText || !awareness) return;

    const view = new EditorView({
      doc: yText.toString(),
      extensions: [
        basicSetup,
        yCollab(yText, awareness),
        getLanguageExtension(language),
        safeInput({ allowAscii: true }),
        EditorState.readOnly.of(readOnly),
        themeCompartment.of(isDark ? oneDark : []),
        fontSizeCompartment.of(
          EditorView.theme({
            '&': { fontSize: `${fontSize}px` },
          }),
        ),
        avatarCompartment.of(
          lineAvatarExtension(lineToUsersMap, handleGutterClick),
        ),
        EditorState.readOnly.of(readOnly),
        ...(readOnly ? [readOnlyToast()] : []),
        capacityLimitInputBlocker(),
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

  // lineToUsersMap이 바뀔 때 avatarCompartment만 갱신
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: avatarCompartment.reconfigure(
        lineAvatarExtension(lineToUsersMap, handleGutterClick, fontSize),
      ),
    });
  }, [lineToUsersMap, avatarCompartment, handleGutterClick, fontSize]);

  // 다크모드 변경 시 테마 compartment 갱신
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const themeExtension = isDark ? oneDark : [];
    view.dispatch({
      effects: themeCompartment.reconfigure(themeExtension),
    });
  }, [isDark, themeCompartment]);

  // 폰트 사이즈 compartment 갱신
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

  return (
    <>
      <div ref={editorRef} className="h-full" />
      <AvatarGutterMenu
        isOpen={menuState.isOpen}
        position={menuState.position}
        users={menuState.users}
        onClose={() => setMenuState((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
