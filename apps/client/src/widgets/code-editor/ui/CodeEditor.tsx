import { useRef } from 'react'; // useState, useEffect 불필요
// Hooks
import { useYText } from '@/shared/lib/hooks/useYText';
import type { CodeEditorProps } from '../lib/types';
import { useDarkMode } from '@/shared/lib/hooks/useDarkMode';
import { useSettings } from '@/shared/lib/hooks/useSettings';
import { useAvatarMenu } from '../hooks/useAvatarMenu';
import { useLineAvatars } from '../hooks/useLineAvatars';
import { useEditorExtensions } from '../hooks/useEditorExtensions';
import { useCodeMirror } from '../hooks/useCodeMirror';
import { DEFAULT_LANGUAGE } from '@codejam/common';

// Components
import { AvatarGutterMenu } from './AvatarGutterMenu';

export default function CodeEditor({
  fileId,
  language = DEFAULT_LANGUAGE,
  readOnly = false,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { yText, awareness } = useYText(fileId);
  const { isDark } = useDarkMode();
  const {
    fontSize,
    showRemoteCursor,
    showGutterAvatars,
    alwaysShowCursorLabels,
  } = useSettings();

  const { menuState, handleGutterClick, closeMenu } = useAvatarMenu();

  const users = useLineAvatars(awareness ?? undefined, fileId);

  const { extensions, compartments } = useEditorExtensions({
    yText: yText ?? null,
    awareness: awareness ?? null,
    language,
    readOnly,
    isDark,
    fontSize,
    users,
    handleGutterClick,
    showRemoteCursor,
    showGutterAvatars,
    alwaysShowCursorLabels,
  });

  useCodeMirror({
    containerRef,
    docString: yText?.toString() ?? '',
    extensions,
    autoFocus: false,
    compartments,
    isDark,
    fontSize,
    yText: yText ?? null,
    users,
    handleGutterClick,
    showRemoteCursor,
    showGutterAvatars,
    alwaysShowCursorLabels,
  });

  return (
    <>
      <div ref={containerRef} className="h-screen" />
      <AvatarGutterMenu
        isOpen={menuState.isOpen}
        position={menuState.position}
        users={menuState.users}
        onClose={closeMenu}
      />
    </>
  );
}
