import type { Language } from '../types/entities.js';

// 언어 타입
export const LANGUAGES = ['javascript', 'html', 'css'] as const;

// 파일 확장자 타입
export const EXT_TYPES = [
  'js',
  'ts',
  'jsx',
  'tsx',
  'html',
  'css',
  'cjs',
  'mjs',
  'shtml',
  'ehtml',
  'c',
  'cpp',
  'java',
  'py',
] as const;

// 파일명 체크 결과 타입
export const FILENAME_CHECK_RESULT_TYPES = [
  'ext',
  'duplicate',
  'no_room',
] as const;

export const DEFAULT_LANGUAGE: Language = 'javascript';

export const DEFAULT_FILE_NAME: Record<Language, string> = {
  javascript: 'main.js',
  html: 'index.html',
  css: 'style.css',
};

const htmlTemplate = /* html */ `<!-- Write your HTML code here -->

<!DOCTYPE html>
<html>
  <head>
    <title>CodeJam</title>
  </head>
  <body>
    <h1>Hello, CodeJam!</h1>
  </body>
</html>
`;

const cssTemplate = /* css */ `/* Write your CSS code here */

.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
`;

const javascriptTemplate = /* javascript */ `// Write your JavaScript code here

function hello() {
  console.log('Hello, CodeJam!');
}
`;

export const DEFAULT_FILE_TEMPLATE: Record<Language, string> = {
  html: htmlTemplate,
  css: cssTemplate,
  javascript: javascriptTemplate,
};

export const getDefaultFileName = (language?: Language): string => {
  if (!language) return DEFAULT_FILE_NAME.javascript;
  return DEFAULT_FILE_NAME[language];
};

export const getDefaultFileTemplate = (language?: Language): string => {
  if (!language) return DEFAULT_FILE_TEMPLATE.javascript;
  return DEFAULT_FILE_TEMPLATE[language];
};
