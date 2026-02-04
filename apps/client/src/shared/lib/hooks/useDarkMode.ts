// useDarkMode.ts
import { useEffect } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from '@codejam/ui';

type HiddenThemeType = 'rainbow' | 'neon' | 'pastel' | null;

interface ThemeState {
  isDark: boolean;
  hiddenTheme: HiddenThemeType; // 활성화된 히든 테마 타입
  themeToggleCount: number; // 테마 토글 횟수
  sidebarToggleCount: number; // 사이드바 토글 횟수
  consoleToggleCount: number; // 콘솔 토글 횟수
  incrementThemeToggle: () => void;
  incrementSidebarToggle: () => void;
  incrementConsoleToggle: () => void;
  toggleTheme: () => void;
}

const HIDDEN_THEME_CONFIG = {
  rainbow: {
    threshold: 10,
    messages: [
      '🎉 축하합니다! 레인보우 테마를 발견하셨습니다!',
      '🌈 레인보우 코딩 모드 활성화! 생산성 +999%',
      '🎨 당신은 이제... 진정한 컬러마스터입니다',
      '✨ 10번 토글의 진리를 깨달은 당신... 존경합니다',
      '🦄 유니콘이 당신의 코드를 축복합니다 🦄',
      '🎪 서커스가 시작됩니다! 🤹',
      '🌟 전설의 레인보우 테마를 손에 넣었다!',
      '🎯 업적 달성: "빛의 수호자" 언락!',
    ],
  },
  neon: {
    threshold: 7,
    messages: [
      '⚡ 네온 테마 언락! 사이버펑크 모드 시작!',
      '🚪 사이드바 마스터 등극! 네온 테마 획득!',
      '💜 사이버 스페이스로의 초대장을 받았습니다',
      '🎮 업적 달성: "사이드바 워리어" - 네온 테마!',
      '✨ 7번의 토글로 미래를 열었습니다',
      '🌃 네온 사인이 당신을 환영합니다',
    ],
  },
  pastel: {
    threshold: 5,
    messages: [
      '🌸 파스텔 테마 언락! 부드러운 코딩 시작!',
      '🖥️ 콘솔 마스터 인증! 파스텔 테마 획득!',
      '💫 5번의 토글로 평온함을 찾았습니다',
      '🎨 업적 달성: "콘솔 커맨더" - 파스텔 천국!',
      '☁️ 구름 위의 코딩 환경이 준비되었습니다',
      '✨ 터미널이 당신에게 평화를 선물합니다',
    ],
  },
};

// 히든 테마 활성화 체크 및 메시지 표시 헬퍼
const checkAndActivateHiddenTheme = (
  currentTheme: HiddenThemeType,
  count: number,
  themeType: HiddenThemeType,
): HiddenThemeType => {
  if (!themeType || currentTheme) return currentTheme; // 이미 활성화된 테마가 있으면 변경 안 함

  const config = HIDDEN_THEME_CONFIG[themeType];
  const shouldActivate = count >= config.threshold;

  if (shouldActivate) {
    const randomMsg =
      config.messages[Math.floor(Math.random() * config.messages.length)];

    toast(randomMsg, {
      description: '새로고침하면 원래대로 돌아갑니다 😉',
      duration: 5000,
    });

    return themeType;
  }

  return null;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      hiddenTheme: null,
      themeToggleCount: 0,
      sidebarToggleCount: 0,
      consoleToggleCount: 0,

      toggleTheme: () =>
        set((state) => {
          const nextCount = state.themeToggleCount + 1;
          const newTheme = checkAndActivateHiddenTheme(
            state.hiddenTheme,
            nextCount,
            'rainbow',
          );

          return {
            isDark: !state.isDark,
            themeToggleCount: nextCount,
            hiddenTheme: newTheme || state.hiddenTheme,
          };
        }),

      incrementSidebarToggle: () =>
        set((state) => {
          const nextCount = state.sidebarToggleCount + 1;
          const newTheme = checkAndActivateHiddenTheme(
            state.hiddenTheme,
            nextCount,
            'neon',
          );

          return {
            sidebarToggleCount: nextCount,
            hiddenTheme: newTheme || state.hiddenTheme,
          };
        }),

      incrementConsoleToggle: () =>
        set((state) => {
          const nextCount = state.consoleToggleCount + 1;
          const newTheme = checkAndActivateHiddenTheme(
            state.hiddenTheme,
            nextCount,
            'pastel',
          );

          return {
            consoleToggleCount: nextCount,
            hiddenTheme: newTheme || state.hiddenTheme,
          };
        }),

      incrementThemeToggle: () =>
        set((state) => ({
          themeToggleCount: state.themeToggleCount + 1,
        })),
    }),
    {
      name: 'theme-mode',
      storage: createJSONStorage(() => localStorage),
      // 중요: 새로고침하면 날아가도록 isDark만 저장함
      partialize: (state) => ({ isDark: state.isDark }),
    },
  ),
);

export function useDarkMode() {
  const { isDark, hiddenTheme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;

    // 다크모드 적용
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');

    // 모든 히든 테마 클래스 제거
    root.classList.remove('theme-rainbow', 'theme-neon', 'theme-pastel');

    // 활성화된 히든 테마 적용
    if (hiddenTheme) {
      root.classList.add(`theme-${hiddenTheme}`);
    }
  }, [isDark, hiddenTheme]);

  return { isDark, hiddenTheme, toggleTheme };
}
