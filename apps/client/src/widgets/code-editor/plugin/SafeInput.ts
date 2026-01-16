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
  active: boolean; // 팝업 표시 여부
  pos: number; // 팝업이 뜰 위치
  tempValue: string; // 작성 중이던 텍스트 임시 저장
}

const safeInputAnnotation = Annotation.define<boolean>();

// --- 2. 헬퍼 ---
const isAscii = (str: string) =>
  [...str].every((ch) => ch.charCodeAt(0) <= 0x7f);

// 다크 모드 감지 함수
const isDarkTheme = () => {
  return document.documentElement.classList.contains('dark');
};

const getStyles = () => {
  const isDark = isDarkTheme();

  return {
    popup: `
      padding: 0.8em; 
      background: ${isDark ? '#27272a' : 'white'}; 
      border: 1px solid ${isDark ? '#3f3f46' : '#ccc'};
      border-radius: 6px; 
      box-shadow: 0 4px 12px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)'};
      
      display: flex; 
      flex-direction: column; 
      gap: 0.5em; 
      z-index: 9999; 
      min-width: 220px;
      box-sizing: border-box;
      
      /* 높이를 콘텐츠에 맞게 자동으로 늘림 */
      height: auto;
      min-height: fit-content;
      
      overflow: hidden; 
    `,
    inputRow: `
      display: flex; gap: 6px; width: 100%;
    `,
    input: `
      flex: 1; padding: 4px; 
      border: 1px solid ${isDark ? '#3f3f46' : '#ddd'}; 
      border-radius: 4px; outline: none; font-size: 14px;
      background: ${isDark ? '#18181b' : 'white'};
      color: ${isDark ? '#fafafa' : '#1a1a1a'};
    `,
    button: `
      padding: 0 10px; cursor: pointer; 
      background: ${isDark ? '#3f3f46' : '#f3f4f6'}; 
      border: none; border-radius: 4px; font-weight: bold; 
      color: ${isDark ? '#fafafa' : '#555'};
    `,
    hint: `
      font-size: 11px; 
      color: ${isDark ? '#a1a1aa' : '#999'}; 
      text-align: right; margin-top: 2px; padding-right: 2px; user-select: none;
    `,
  };
};

// --- 3. 상태 관리 ---
const setSafeInputState = StateEffect.define<SafeInputState>();

const safeInputField = StateField.define<SafeInputState>({
  create: () => ({ active: false, pos: 0, tempValue: '' }),
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setSafeInputState)) return effect.value;
    }
    return value;
  },
  provide: (field) =>
    showTooltip.from(field, (state) => {
      if (!state.active) return null;
      return createInputPopup(state.pos, state.tempValue);
    }),
});

// --- 4. UI 렌더링 ---
function createInputPopup(pos: number, initialValue: string): Tooltip {
  return {
    pos,
    above: true,
    strictSide: true,
    create: (view) => {
      const styles = getStyles(); // 현재 테마에 맞는 스타일 가져오기

      const dom = document.createElement('div');
      dom.className = 'safe-input-popup';
      dom.style.cssText = styles.popup;

      const row = document.createElement('div');
      row.style.cssText = styles.inputRow;

      const input = document.createElement('input');
      input.className = 'safe-input-field';
      input.placeholder = '텍스트 입력...';
      input.style.cssText = styles.input;
      // 기존에 작성하다 끈 내용이 있다면 복구
      input.value = initialValue;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = '↵';
      btn.style.cssText = styles.button;

      row.appendChild(input);
      row.appendChild(btn);

      const hint = document.createElement('div');
      hint.textContent = 'Enter: 입력 / Esc: 취소 / 외부클릭: 임시저장';
      hint.style.cssText = styles.hint;

      dom.appendChild(row);
      dom.appendChild(hint);

      // --- 로직 ---

      // Submit: 에디터에 반영하고 종료 (Enter, 버튼)
      const submit = () => {
        const text = input.value;
        if (!text) {
          cancel();
          return;
        }
        view.dispatch({
          changes: { from: pos, insert: text },
          selection: { anchor: pos + text.length },
          effects: setSafeInputState.of({
            active: false,
            pos: 0,
            tempValue: '',
          }),
          annotations: safeInputAnnotation.of(true),
        });
        view.focus();
      };

      // Suspend: 반영하지 않고 상태만 저장하고 닫기 (외부 클릭)
      const suspend = () => {
        // 현재 입력된 값을 tempValue에 저장하고 active만 false로 변경
        view.dispatch({
          effects: setSafeInputState.of({
            active: false,
            pos: 0,
            tempValue: input.value, // 값 보존
          }),
          annotations: safeInputAnnotation.of(true),
        });
      };

      // Cancel: 저장 없이 그냥 닫기 (ESC)
      const cancel = () => {
        view.dispatch({
          effects: setSafeInputState.of({
            active: false,
            pos: 0,
            tempValue: '',
          }),
          annotations: safeInputAnnotation.of(true),
        });
        view.focus();
      };

      // --- 이벤트 핸들러 ---

      const onClickOutside = (e: MouseEvent) => {
        if (e.target instanceof Node && !dom.contains(e.target)) {
          suspend();
        }
      };

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.isComposing) {
          e.preventDefault();
          submit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancel();
        }
      });

      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        submit();
      };

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const len = input.value.length;
          input.focus();
          input.setSelectionRange(len, len);
        });
      });

      return {
        dom,
        // 팝업이 화면에 나타날 때 실행
        mount() {
          document.addEventListener('mousedown', onClickOutside);
        },
        // 팝업이 사라질 때 실행 (클린업)
        destroy() {
          document.removeEventListener('mousedown', onClickOutside);
        },
      };
    },
  };
}

// --- 5. Extension 로직 ---
export function safeInput(
  options: SafeInputOptions = { allowAscii: true },
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
          tempValue: currentState.tempValue,
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
          type !== 'insertFromDrop' &&
          type !== 'insertParagraph' &&
          type !== 'insertLineBreak'
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
