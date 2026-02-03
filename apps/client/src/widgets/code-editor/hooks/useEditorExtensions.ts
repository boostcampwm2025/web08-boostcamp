import { useMemo } from 'react';
import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { yCollab } from 'y-codemirror.next';
import { Awareness } from 'y-protocols/awareness';
import * as Y from 'yjs';

// Plugins
import { readOnlyToast } from '../plugin/ReadOnlyToast';
import { capacityLimitInputBlocker } from '../plugin/CapacityLimitInputBlocker';
import {
  lineAvatarExtension,
  type AvatarUser,
  type RemoteUser,
} from '../plugin/LineAvatars';
import { localTheme } from '../plugin/LocalTheme';
import { getLanguageExtension } from '../lib/constants';
import { type Language } from '@codejam/common';

const cursorTheme = EditorView.theme({
  // 원격 라인 선택으로 인한 텍스트 밀림 방지
  '.cm-yLineSelection': {
    margin: '0px 0px 0px 6px', // cm-line padding = 6px
  },

  // 커서 이름표 스타일
  '.cm-ySelectionInfo': {
    padding: '2px 6px',
    position: 'absolute',
    top: '-1.6em', // 커서 위에 위치
    left: '-1px',
    zIndex: '1000',
    borderRadius: '6px',
    borderBottomLeftRadius: '0', // 말풍선 느낌
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white', // 배경색은 y-codemirror가 유저 컬러로 자동 지정함, 글자는 흰색
    pointerEvents: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    lineHeight: 'normal',
    transition: 'opacity 0.2s ease-in-out',
  },
  '.cm-ySelectionCaretDot': {
    display: 'none',
  },
});

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
      EditorView.lineWrapping,
      yCollab(yText, awareness),
      getLanguageExtension(language),
      // safeInput({ allowAscii: true }),
      capacityLimitInputBlocker(),

      localTheme,
      cursorTheme,

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- isDark, fontSize, users, handleGutterClick은 view 재생성 방지 목적
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
