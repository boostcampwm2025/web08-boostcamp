import { useEffect, useRef, useState } from 'react';
import { EditorView } from 'codemirror';

// Hooks
import { useYText } from '@/shared/lib/hooks/useYText';
import { useDarkMode } from '@/shared/lib/hooks/useDarkMode';
import { useSettings } from '@/shared/lib/hooks/useSettings';
import { useAvatarMenu } from '../hooks/useAvatarMenu';
import { useLineAvatars } from '../hooks/useLineAvatars';
import { useEditorExtensions } from '../hooks/useEditorExtensions';
import { useCodeMirror } from '../hooks/useCodeMirror';

// Components
import { AvatarGutterMenu } from './AvatarGutterMenu';

type Language = 'javascript' | 'html' | 'css';

interface CodeEditorProps {
  fileId?: string;
  language?: Language;
  readOnly?: boolean;
}

export default function CodeEditor({
  fileId = 'prototype',
  language = 'javascript',
  readOnly = false,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { yText, awareness } = useYText(fileId);
  const { isDark } = useDarkMode();
  const { fontSize } = useSettings();

  const [editorView, setEditorView] = useState<EditorView | null>(null);

  const { menuState, handleGutterClick, closeMenu } = useAvatarMenu();

  const lineToUsersMap = useLineAvatars(
    awareness ?? undefined,
    yText ?? undefined,
    fileId,
    editorView, // 여기서 editorView 필요
  );

  const { extensions, compartments } = useEditorExtensions({
    yText: yText ?? null,
    awareness: awareness ?? null,
    language,
    readOnly,
    isDark,
    fontSize,
    lineToUsersMap,
    handleGutterClick,
  });

  const { viewRef } = useCodeMirror({
    containerRef,
    docString: yText?.toString() ?? '',
    extensions,
    autoFocus: false,
    compartments,
    isDark,
    fontSize,
    lineToUsersMap,
    handleGutterClick,
  });

  // useCodeMirror가 생성한 viewRef.current를 로컬 state인 editorView로 동기화.
  // 이를 통해 useLineAvatars에게 생성된 뷰 인스턴스를 전달.
  useEffect(() => {
    if (viewRef.current && viewRef.current !== editorView) {
      setEditorView(viewRef.current);
    }
  }, [viewRef.current, editorView]);

  return (
    <>
      <div ref={containerRef} className="h-full" />

      <AvatarGutterMenu
        isOpen={menuState.isOpen}
        position={menuState.position}
        users={menuState.users}
        onClose={closeMenu}
      />
    </>
  );
}
