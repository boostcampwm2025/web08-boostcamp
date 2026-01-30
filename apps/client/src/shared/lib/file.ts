export { type ExtType, extname, purename } from '@codejam/common';

const pistonLanguageMap: Record<string, string> = {
  c: 'c',
  cpp: 'c++',
  java: 'java',
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
};

/**
 * Map file extension to Piston executable language
 * @param extension - File extension
 * @returns Piston language identifier or null if not executable
 */
export function getPistonLanguage(extension: string): string | null {
  return pistonLanguageMap[extension.toLowerCase()] || null;
}
