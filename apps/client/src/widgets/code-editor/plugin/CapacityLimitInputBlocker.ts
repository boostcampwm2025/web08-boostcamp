import { EditorView } from 'codemirror';
import { toast } from 'sonner';
import { useFileStore } from '@/stores/file';

export function capacityLimitInputBlocker() {
  return EditorView.domEventHandlers({
    beforeinput: (event, _view) => {
      const isOverLimit = useFileStore.getState().isOverLimit;
      if (!isOverLimit) return false;

      // 삭제는 허용 (Backspace, Delete)
      if (
        event.inputType === 'deleteContentBackward' ||
        event.inputType === 'deleteContentForward'
      ) {
        return false; // 허용
      }

      // 입력만 차단
      if (
        event.inputType === 'insertText' ||
        event.inputType === 'insertLineBreak'
      ) {
        toast.warning('1MB 용량에 도달했습니다. 삭제 후 다시 입력하세요.');
        event.preventDefault();
        return true; // 차단
      }

      return false;
    },
    keydown: (event, _view) => {
      const isOverLimit = useFileStore.getState().isOverLimit;
      if (!isOverLimit) return false;

      // 삭제 키는 허용
      if (event.key === 'Backspace' || event.key === 'Delete') {
        return false; // 허용
      }

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

      // 실제 문자/입력 키만 차단
      // key length가 1이면 대부분 입력 가능한 문자
      if (event.key.length === 1 || event.key === 'Enter') {
        toast.warning('1MB 용량에 도달했습니다. 삭제 후 다시 입력하세요.');
        return true; // 이벤트 중단
      }

      return false;
    },
  });
}
