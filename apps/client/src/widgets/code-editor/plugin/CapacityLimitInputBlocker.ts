import { EditorView } from 'codemirror';
import { toast } from 'sonner';
import { useFileStore } from '@/stores/file';

const MAX_LIMIT = 1_000_000; // 1MB

export function capacityLimitInputBlocker() {
  return EditorView.domEventHandlers({
    // 1. 붙여넣기 (Paste) 차단
    paste: (event, view) => {
      if (!event.clipboardData) return false;

      const pastedText = event.clipboardData.getData('text/plain');
      if (!pastedText) return false;

      const { capacityBytes } = useFileStore.getState();

      // 선택 영역 길이 (교체될 텍스트)
      const selection = view.state.selection.main;
      const selectedLength = selection.to - selection.from;

      // 현재 파일에서 추가될 순 증가량 = 붙여넣을 길이 - 선택된 길이
      const fileDelta = pastedText.length - selectedLength;

      // 최종 예상 용량 = 전체 용량 + 현재 파일의 순 증가량
      const futureCapacity = capacityBytes + fileDelta;

      if (futureCapacity > MAX_LIMIT) {
        toast.warning(
          `복붙할 내용이 너무 큽니다. 1MB 용량을 초과합니다. (예상: ${(futureCapacity / 1_000_000).toFixed(2)}MB)`,
        );
        event.preventDefault();
        return true; // 차단
      }

      return false; // 허용
    },

    drop: () => {
      return true;
    },

    // 2. 키 입력 (Typing) 차단
    keydown: (event, view) => {
      // 삭제 키, 네비게이션 키, 기능 키 등은 무조건 허용
      const allowedKeys = [
        'Backspace',
        'Delete',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
        'PageUp',
        'PageDown',
        'Tab',
        'Escape',
      ];
      const isModifier = event.ctrlKey || event.metaKey || event.altKey;

      if (
        allowedKeys.includes(event.key) ||
        isModifier ||
        event.key.startsWith('F')
      ) {
        return false;
      }

      // Enter 키는 줄바꿈이므로 체크 필요
      if (event.key === 'Enter') {
        const { capacityBytes } = useFileStore.getState();
        const selection = view.state.selection.main;
        const selectedLength = selection.to - selection.from;

        // Enter는 선택 영역을 삭제하고 줄바꿈 추가
        const fileDelta = selectedLength > 0 ? -selectedLength + 1 : 1;
        const futureCapacity = capacityBytes + fileDelta;

        if (futureCapacity > MAX_LIMIT) {
          toast.warning('최대 용량에 도달했습니다.');
          event.preventDefault();
          return true;
        }
        return false;
      }

      // 입력 가능한 키인 경우 용량 체크
      if (event.key.length === 1) {
        const { capacityBytes } = useFileStore.getState();
        const selection = view.state.selection.main;
        const selectedLength = selection.to - selection.from;

        // 한 글자 입력 시: 선택 영역이 있으면 교체, 없으면 +1
        const fileDelta = selectedLength > 0 ? -selectedLength + 1 : 1;
        const futureCapacity = capacityBytes + fileDelta;

        if (futureCapacity > MAX_LIMIT) {
          toast.warning('최대 용량에 도달했습니다.');
          event.preventDefault();
          return true;
        }
      }
      return false;
    },
  });
}
