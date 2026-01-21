import { useEffect, useRef, useState } from 'react';
import type { Awareness } from 'y-protocols/awareness';
import * as Y from 'yjs';
import type { LineToUsersMap } from '@/widgets/code-editor/plugin/LineAvatars';

/**
 * awareness와 yText, fileId를 받아 라인별 유저 매핑을 반환하는 훅
 */
export function useLineAvatars(
  awareness: Awareness | undefined,
  yText: Y.Text | undefined,
  fileId: string | undefined,
  editorView: import('codemirror').EditorView | null,
): LineToUsersMap {
  const [lineToUsersMap, setLineToUsersMap] = useState<LineToUsersMap>(
    new Map(),
  );
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!awareness || !yText?.doc || !editorView) return;

    const handleAwarenessChange = () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        const states = awareness.getStates();
        const newMap: LineToUsersMap = new Map();

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
              // ignore
            }
          }
          if (absIndex !== null) {
            const docLength = editorView.state.doc.length;
            const pos = Math.min(Math.max(0, absIndex), docLength);
            const line = editorView.state.doc.lineAt(pos);
            const existing = newMap.get(line.number) || [];
            if (!existing.some((u) => u.hash === user.hash)) {
              newMap.set(line.number, [...existing, user]);
            }
          }
        });
        setLineToUsersMap(newMap);
      }, 50);
    };

    handleAwarenessChange();
    awareness.on('change', handleAwarenessChange);
    awareness.on('update', handleAwarenessChange);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      awareness.off('change', handleAwarenessChange);
      awareness.off('update', handleAwarenessChange);
    };
  }, [awareness, yText, fileId, editorView]);

  return lineToUsersMap;
}
