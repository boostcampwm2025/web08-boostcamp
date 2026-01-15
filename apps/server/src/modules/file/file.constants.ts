export type Language = 'javascript' | 'html' | 'css';

export const DEFAULT_LANGUAGE: Language = 'javascript';

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

export const DEFAULT_FILE_NAME: Record<Language, string> = {
  javascript: 'main.js',
  html: 'index.html',
  css: 'style.css',
};

export const DEFAULT_FILE_TEMPLATE = {
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
