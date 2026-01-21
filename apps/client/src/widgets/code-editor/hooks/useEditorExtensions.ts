import { useMemo } from 'react';
import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { yCollab } from 'y-codemirror.next';
import { Awareness } from 'y-protocols/awareness';
import * as Y from 'yjs';

// Plugins
import { safeInput } from '../plugin/SafeInput';
import { readOnlyToast } from '../plugin/ReadOnlyToast';
import { capacityLimitInputBlocker } from '../plugin/CapacityLimitInputBlocker';
import {
  lineAvatarExtension,
  type AvatarUser,
  type RemoteUser,
} from '../plugin/LineAvatars';
import { getLanguageExtension } from '../lib/constants';
import { type Language } from '../lib/types';

interface UseEditorExtensionsProps {
  yText: Y.Text | null;
  awareness: Awareness | null;
  language: Language;
  readOnly: boolean;
  isDark: boolean;
  fontSize: number;
  users: RemoteUser[];
  handleGutterClick: (params: {
    event: MouseEvent;
    users: AvatarUser[];
  }) => void;
  showRemoteCursor: boolean;
  showGutterAvatars: boolean;
  alwaysShowCursorLabels: boolean;
}

export function useEditorExtensions(props: UseEditorExtensionsProps) {
  const {
    yText,
    awareness,
    language,
    readOnly,
    isDark,
    fontSize,
    users,
    handleGutterClick,
    showRemoteCursor,
    showGutterAvatars,
    alwaysShowCursorLabels,
  } = props;

  // Compartments
  const compartments = useMemo(
    () => ({
      theme: new Compartment(),
      fontSize: new Compartment(),
      avatar: new Compartment(),
      readOnly: new Compartment(),
      cursorStyle: new Compartment(),
    }),
    [],
  );

  const extensions = useMemo<Extension[]>(() => {
    if (!yText || !awareness) return [];

    return [
      basicSetup,
      yCollab(yText, awareness),
      getLanguageExtension(language),
      safeInput({ allowAscii: true }),
      capacityLimitInputBlocker(),

      // Dynamic Compartments Initial Config
      compartments.theme.of(isDark ? oneDark : []),
      compartments.fontSize.of(
        EditorView.theme({ '&': { fontSize: `${fontSize}px` } }),
      ),
      compartments.avatar.of(
        showGutterAvatars
          ? lineAvatarExtension(users, yText, handleGutterClick, fontSize)
          : [],
      ),
      compartments.cursorStyle.of(
        EditorView.theme({
          // 원격 커서 숨기기
          ...(!showRemoteCursor && {
            '.cm-ySelection, .cm-ySelectionInfo, .cm-ySelectionCaret': {
              display: 'none !important',
            },
          }),
          // 이름 항상 보이기 로직
          ...(alwaysShowCursorLabels && {
            '.cm-ySelectionInfo': {
              opacity: '1 !important',
              visibility: 'visible !important',
              // 필요 시 애니메이션 제거
              transition: 'none !important',
            },
          }),
        }),
      ),
      // ReadOnly Handling
      EditorState.readOnly.of(readOnly),
      ...(readOnly ? [readOnlyToast()] : []),

      // Base Theme
      EditorView.theme({
        '&': { height: '100%' },
        '.cm-scroller': { overflow: 'auto' },
        ...(readOnly && {
          '.cm-cursor, .cm-dropCursor': { display: 'none !important' },
        }),
      }),
    ];
  }, [
    yText,
    awareness,
    language,
    readOnly,
    compartments,
    showGutterAvatars,
    showRemoteCursor,
    alwaysShowCursorLabels,
  ]);

  return { extensions, compartments };
}
