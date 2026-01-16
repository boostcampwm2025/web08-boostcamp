export type ExtType =
  | 'js'
  | 'ts'
  | 'jsx'
  | 'tsx'
  | 'html'
  | 'css'
  | 'cjs'
  | 'mjs'
  | 'shtml'
  | 'ehtml'
  | undefined;
export function extname(name: string | undefined): ExtType {
  if (!name) return undefined;
  const lastDot = name.trim().lastIndexOf('.');

  if (lastDot === -1) {
    return undefined;
  }

  return name
    .trim()
    .substring(lastDot + 1)
    .toLowerCase() as ExtType;
}

export function purename(name: string): string {
  const lastDot = name.trim().lastIndexOf('.');

  if (lastDot === -1) {
    return '';
  }

  return name.trim().substring(0, lastDot);
}
