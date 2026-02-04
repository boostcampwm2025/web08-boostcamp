// useEditorExtensions.ts 파일 상단 혹은 별도 파일
import { EditorView } from 'codemirror';

// 🌈 레인보우 테마
export const rainbowEditorTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#fff0f5',
      color: '#ff1493',
    },
    '.cm-content': {
      caretColor: '#ff69b4',
    },
    '.cm-gutters': {
      backgroundColor: '#ffe4e1',
      color: '#ff1493',
      border: 'none',
    },
    '.cm-activeLine': { backgroundColor: '#fff0f8' },
    '.cm-activeLineGutter': { backgroundColor: '#ffc0e0' },
    '.cm-line': {
      animation: 'rainbow-text 8s linear infinite',
    },
    '@keyframes rainbow-text': {
      '0%': { filter: 'hue-rotate(0deg)' },
      '100%': { filter: 'hue-rotate(360deg)' },
    },
  },
  { dark: false },
);

// ⚡ 네온 테마
export const neonEditorTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#0a0a14',
      color: '#00ffff',
    },
    '.cm-content': {
      caretColor: '#ff00ff',
      textShadow: '0 0 5px currentColor',
    },
    '.cm-gutters': {
      backgroundColor: '#14141f',
      color: '#00ffff',
      border: '1px solid #ff00ff',
      boxShadow: '0 0 10px #ff00ff',
    },
    '.cm-activeLine': {
      backgroundColor: '#1a1a2e',
      boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#1a1a2e',
      color: '#ff00ff',
    },
    '.cm-cursor': {
      borderLeftColor: '#ff00ff',
      borderLeftWidth: '2px',
    },
    '.cm-selectionBackground': {
      backgroundColor: 'rgba(255, 0, 255, 0.2)',
    },
  },
  { dark: true },
);

// 🌸 파스텔 테마
export const pastelEditorTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#fef9f3',
      color: '#8b7d6b',
    },
    '.cm-content': {
      caretColor: '#d4a5a5',
    },
    '.cm-gutters': {
      backgroundColor: '#fff5ee',
      color: '#b8a39d',
      border: 'none',
    },
    '.cm-activeLine': { backgroundColor: '#fff8f0' },
    '.cm-activeLineGutter': {
      backgroundColor: '#ffe4d6',
      color: '#d4a5a5',
    },
    '.cm-cursor': {
      borderLeftColor: '#d4a5a5',
    },
    '.cm-selectionBackground': {
      backgroundColor: 'rgba(212, 165, 165, 0.2)',
    },
  },
  { dark: false },
);
