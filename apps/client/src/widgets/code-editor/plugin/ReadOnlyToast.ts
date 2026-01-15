import { EditorView } from 'codemirror';
import { toast } from 'sonner';

export function readOnlyToast() {
  return EditorView.domEventHandlers({
    keydown: (event, view) => {
      if (!view.state.readOnly) return false;

      // Ctrl/Cmd + 키 조합은 모두 허용 (복사, 전체선택, 새로고침 등)
      if (event.ctrlKey || event.metaKey) return false;

      // 기능 키 허용 (F1-F12, Esc 등)
      if (event.key.startsWith('F') || event.key === 'Escape') return false;

      // 네비게이션 키 허용
      const navigationKeys = [
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
        'PageUp',
        'PageDown',
        'Tab',
      ];
      if (navigationKeys.includes(event.key)) return false;

      // 수정 키만 허용하지 않음 (Shift, Alt, Control, Meta는 단독으로는 무해)
      const modifierKeys = ['Shift', 'Control', 'Alt', 'Meta'];
      if (modifierKeys.includes(event.key)) return false;

      // 실제 문자/입력 키만 차단하고 토스트 표시
      // key length가 1이면 대부분 입력 가능한 문자
      if (
        event.key.length === 1 ||
        event.key === 'Enter' ||
        event.key === 'Backspace' ||
        event.key === 'Delete'
      ) {
        toast.warning('편집 권한이 없습니다.');
        return true; // 이벤트 중단
      }

      return false;
    },
    mousedown: (_, view) => {
      if (!view.state.readOnly) return false;
      return false;
    },
  });
}
