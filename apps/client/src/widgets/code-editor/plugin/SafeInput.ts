import {
  type Extension,
  StateField,
  StateEffect,
  Annotation,
} from '@codemirror/state';
import { EditorView, showTooltip, type Tooltip } from '@codemirror/view';

// --- 1. 타입 & 설정 ---
export interface SafeInputOptions {
  allowAscii?: boolean;
}

interface SafeInputState {
  active: boolean;
  pos: number;
}

const safeInputAnnotation = Annotation.define<boolean>();

// --- 2. 헬퍼 ---
const isAscii = (str: string) => /^[\x00-\x7F]*$/.test(str);

const styles = {
  popup: `
    padding: 8px; background: white; border: 1px solid #ccc;
    border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex; gap: 6px; z-index: 9999; min-width: 200px;
  `,
  input: `
    flex: 1; padding: 4px; border: 1px solid #ddd; border-radius: 4px; outline: none;
  `,
  button: `
    padding: 0 8px; cursor: pointer; background: #f3f4f6; border: none; border-radius: 4px;
  `,
};

// --- 3. 상태 관리 ---
const setSafeInputState = StateEffect.define<SafeInputState>();

const safeInputField = StateField.define<SafeInputState>({
  create: () => ({ active: false, pos: 0 }),
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setSafeInputState)) return effect.value;
    }
    return value;
  },
  provide: (field) =>
    showTooltip.from(field, (state) => {
      if (!state.active) return null;
      return createInputPopup(state.pos);
    }),
});

// --- 4. UI 렌더링 ---
function createInputPopup(pos: number): Tooltip {
  return {
    pos,
    above: true,
    strictSide: true,
    create: (view) => {
      const dom = document.createElement('div');
      dom.className = 'safe-input-popup';
      dom.style.cssText = styles.popup;

      const input = document.createElement('input');
      input.className = 'safe-input-field';
      input.placeholder = '텍스트 입력...';
      input.style.cssText = styles.input;

      const btn = document.createElement('button');
      btn.textContent = '↵';
      btn.style.cssText = styles.button;

      // 닫기 액션
      const close = () => {
        view.dispatch({
          effects: setSafeInputState.of({ active: false, pos: 0 }),
          annotations: safeInputAnnotation.of(true),
        });
        view.focus();
      };

      // 제출 액션
      const submit = () => {
        const text = input.value;
        if (!text) {
          close();
          return;
        }
        view.dispatch({
          changes: { from: pos, insert: text },
          selection: { anchor: pos + text.length },
          effects: setSafeInputState.of({ active: false, pos: 0 }),
          annotations: safeInputAnnotation.of(true),
        });
        view.focus();
      };

      // 이벤트 리스너
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.isComposing) {
          e.preventDefault();
          submit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          close();
        }
      });
      btn.onclick = (e) => {
        e.preventDefault();
        submit();
      };

      dom.appendChild(input);
      dom.appendChild(btn);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          input.value = '';
          input.focus();
          // 혹시라도 딸려온 값이 있다면 제거
          if (input.value.length > 0) input.value = '';
        });
      });

      return { dom };
    },
  };
}

// --- 5. Extension 로직 ---
export function safeInput(
  options: SafeInputOptions = { allowAscii: true }
): Extension {
  const openPopup = (view: EditorView) => {
    // [!IMPORTANT] 에디터의 IME 세션 강제 종료
    // blur()를 호출하면 브라우저는 조합 중인 한글 등을 강제로 확정하거나 취소함.
    // 이를 통해 에디터 본문에 이상한 문자가 남는 것을 물리적으로 차단함.
    view.contentDOM.blur();

    const currentState = view.state.field(safeInputField);
    if (!currentState.active) {
      view.dispatch({
        effects: setSafeInputState.of({
          active: true,
          pos: view.state.selection.main.from,
        }),
        annotations: safeInputAnnotation.of(true),
        filter: false,
      });
    }
  };

  return [
    safeInputField,
    EditorView.domEventHandlers({
      // 한글/IME 입력 시작 감지
      compositionstart(event, view) {
        event.preventDefault();
        openPopup(view);
        return true;
      },

      // 실제 텍스트 입력 직전 감지
      beforeinput(event, view) {
        const type = event.inputType;
        // 붙여넣기나 드롭은 허용하고, 일반 타이핑만 가로챔
        if (
          type.startsWith('insert') &&
          type !== 'insertFromPaste' &&
          type !== 'insertFromDrop'
        ) {
          // 옵션에 따라 ASCII 문자는 허용할지 결정
          if (options.allowAscii && event.data && isAscii(event.data)) {
            return false;
          }
          event.preventDefault();
          openPopup(view);
          return true;
        }
        return false;
      },

      // 키보드 누름 감지
      keydown(event, view) {
        // 단축키(Ctrl/Meta/Alt)나 기능키는 통과
        if (
          event.ctrlKey ||
          event.metaKey ||
          event.altKey ||
          event.key.length > 1
        ) {
          return false;
        }
        // ASCII 허용 시 통과
        if (options.allowAscii && isAscii(event.key)) {
          return false;
        }

        event.preventDefault();
        event.stopPropagation();
        openPopup(view);
        return true;
      },

      // IME 관련 추가 방어
      compositionupdate: (e) => (e.preventDefault(), true),
      compositionend: (e) => (e.preventDefault(), true),
    }),
  ];
}
