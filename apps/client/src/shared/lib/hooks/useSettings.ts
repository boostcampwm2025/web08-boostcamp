import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
  fontSize: number;
  showRemoteCursor: boolean; // 원격 커서 표시 여부
  showGutterAvatars: boolean; // Gutter 아바타 표시 여부
  alwaysShowCursorLabels: boolean; // 커서 이름표 항상 표시 여부
  streamCodeExecutionOutput: boolean; // 코드 실행 출력 스트리밍 여부

  setFontSize: (size: number) => void;
  toggleRemoteCursor: () => void;
  toggleGutterAvatars: () => void;
  toggleCursorLabels: () => void;
  toggleStreamCodeExecutionOutput: () => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      fontSize: 14, // 기본 폰트 사이즈
      showRemoteCursor: true, // 기본값: 보임
      showGutterAvatars: true, // 기본값: 보임
      alwaysShowCursorLabels: false, // 기본값: 숨김 (Hover시에만 보임)
      streamCodeExecutionOutput: true, // 기본값: 코드 실행 출력 시 스트리밍 활성화

      setFontSize: (size) => set({ fontSize: size }),

      toggleRemoteCursor: () =>
        set((state) => ({ showRemoteCursor: !state.showRemoteCursor })),

      toggleGutterAvatars: () =>
        set((state) => ({ showGutterAvatars: !state.showGutterAvatars })),

      toggleCursorLabels: () =>
        set((state) => ({
          alwaysShowCursorLabels: !state.alwaysShowCursorLabels,
        })),

      toggleStreamCodeExecutionOutput: () =>
        set((state) => ({
          streamCodeExecutionOutput: !state.streamCodeExecutionOutput,
        })),

      resetSettings: () =>
        set({
          fontSize: 14,
          showRemoteCursor: true,
          showGutterAvatars: true,
          alwaysShowCursorLabels: false,
          streamCodeExecutionOutput: true,
        }),
    }),
    {
      name: 'editor-settings',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function useSettings() {
  const state = useSettingsStore();

  return {
    // State
    fontSize: state.fontSize,
    showRemoteCursor: state.showRemoteCursor,
    showGutterAvatars: state.showGutterAvatars,
    alwaysShowCursorLabels: state.alwaysShowCursorLabels,
    streamCodeExecutionOutput: state.streamCodeExecutionOutput,

    // Actions
    setFontSize: state.setFontSize,
    toggleRemoteCursor: state.toggleRemoteCursor,
    toggleGutterAvatars: state.toggleGutterAvatars,
    toggleCursorLabels: state.toggleCursorLabels,
    toggleStreamCodeExecutionOutput: state.toggleStreamCodeExecutionOutput,
    resetSettings: state.resetSettings,
  };
}
