import { useEffect, useRef, useState } from 'react';
import { EditorView } from 'codemirror';
import { type Extension } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { lineAvatarExtension, type RemoteUser } from '../plugin/LineAvatars';
import * as Y from 'yjs';

interface UseCodeMirrorProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  docString: string;
  extensions: Extension[];
  autoFocus?: boolean;
  // Dynamic Update Props
  compartments: {
    theme: import('@codemirror/state').Compartment;
    fontSize: import('@codemirror/state').Compartment;
    avatar: import('@codemirror/state').Compartment;
    cursorStyle: import('@codemirror/state').Compartment;
  };
  showRemoteCursor: boolean;
  showGutterAvatars: boolean;
  alwaysShowCursorLabels: boolean;
  isDark: boolean;
  fontSize: number;
  yText: Y.Text | null;
  users: RemoteUser[];
  handleGutterClick?: import('../plugin/LineAvatars').OnAvatarClick;
}

export function useCodeMirror(props: UseCodeMirrorProps) {
  const {
    containerRef,
    docString,
    extensions,
    compartments,
    showRemoteCursor,
    showGutterAvatars,
    alwaysShowCursorLabels,
    isDark,
    fontSize,
    yText,
    users,
    handleGutterClick,
  } = props;

  const viewRef = useRef<EditorView | null>(null);
  const [initialDoc] = useState(docString);

  // Mount Editor
  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      doc: initialDoc,
      extensions,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [extensions, containerRef, initialDoc]);

  // Update Theme
  useEffect(() => {
    viewRef.current?.dispatch({
      effects: compartments.theme.reconfigure(isDark ? oneDark : []),
    });
  }, [isDark, compartments.theme]);

  // Update Font Size
  useEffect(() => {
    viewRef.current?.dispatch({
      effects: compartments.fontSize.reconfigure(
        EditorView.theme({ '&': { fontSize: `${fontSize}px` } }),
      ),
    });
  }, [fontSize, compartments.fontSize]);

  // Update Avatars
  useEffect(() => {
    viewRef.current?.dispatch({
      effects: compartments.avatar.reconfigure(
        showGutterAvatars && handleGutterClick
          ? lineAvatarExtension(users, yText, handleGutterClick, fontSize)
          : [], // false일 경우 extension 제거
      ),
    });
  }, [
    users,
    yText,
    handleGutterClick,
    fontSize,
    compartments.avatar,
    showGutterAvatars,
  ]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: compartments.cursorStyle.reconfigure(
        EditorView.theme({
          ...(!showRemoteCursor && {
            '.cm-ySelection, .cm-ySelectionInfo, .cm-ySelectionCaret': {
              display: 'none !important',
            },
          }),
          ...(alwaysShowCursorLabels && {
            '.cm-ySelectionInfo': {
              opacity: '1 !important',
              visibility: 'visible !important',
              transition: 'none !important',
            },
          }),
        }),
      ),
    });
  }, [showRemoteCursor, alwaysShowCursorLabels, compartments.cursorStyle]);

  return { viewRef };
}
