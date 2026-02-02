import type { Language } from '../types/entities.js';

// 파일 타입
export const FILE_TYPES = ['text', 'image'];

// 언어 타입
export const LANGUAGES = ['javascript', 'html', 'css'] as const;

// 파일 확장자 타입

// prettier-ignore
export const EXT_TYPES = [
  // Web Core
  "html", "css", "js", "ts", "jsx", "tsx", "mjs", "cjs",
  
  // Stylesheets
  "scss", "sass", "less", "postcss",
  
  // Modern Frameworks
  "vue", "svelte", "astro",
  
  // Config / Data
  "json", "jsonc", "json5", "yaml", "yml", "toml", "xml", "env",
  
  // Documentation
  "md", "mdx", "txt",
  
  // Programming Languages
  "py", "pyw", // Python
  "go", // Go
  "rs", // Rust
  "java", "jar", // Java
  "c", "cpp", "h", "hpp", // C/C++
  "cs", // C#
  "php", // PHP
  "rb", // Ruby
  "swift", // Swift
  "kt", "kts", // Kotlin
  "dart", // Dart
  
  // Shell / Database
  "sh", "bash", "ps1", // Shell scripts
  "sql", "prisma", // Database
  "graphql", "gql", // GraphQL
  
  // Infrastructure
  "dockerfile", "dockerignore"
];

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
