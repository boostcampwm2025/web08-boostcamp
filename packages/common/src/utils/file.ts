import type { ExtType } from '../types/entities.js';

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
