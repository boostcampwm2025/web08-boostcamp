export type ExtType = 'js' | 'ts' | 'jsx' | 'tsx' | 'html' | 'css' | undefined;
export function extname(name: string): ExtType {
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
