import { useEffect, useRef } from 'react';
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
    theme: any;
    fontSize: any;
    avatar: any;
  };
  isDark: boolean;
  fontSize: number;
  yText: Y.Text | null;
  users: RemoteUser[];
  handleGutterClick: any;
}

export function useCodeMirror(props: UseCodeMirrorProps) {
  const {
    containerRef,
    docString,
    extensions,
    compartments,
    isDark,
    fontSize,
    yText,
    users,
    handleGutterClick,
  } = props;

  const viewRef = useRef<EditorView | null>(null);

  // Mount Editor
  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      doc: docString,
      extensions,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [extensions]);

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
        lineAvatarExtension(users, yText, handleGutterClick, fontSize),
      ),
    });
  }, [users, yText, handleGutterClick, fontSize, compartments.avatar]);

  return { viewRef };
}
