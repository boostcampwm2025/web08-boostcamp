import { createElement, type ReactNode } from 'react';

export interface AvatarProvider {
  createComponent(id: string, size: number): ReactNode;
  toSvgString(id: string, size: number): string;
}

export interface GeneratedAvatarProps {
  id: string;
  badge?: ReactNode;
  size?: number;
  className?: string;
}

export function createAvatarGenerator(provider: AvatarProvider) {
  function Avatar({
    id,
    badge,
    size = 40,
    className = '',
  }: GeneratedAvatarProps) {
    return createElement(
      'div',
      { className: `relative ${className}` },
      provider.createComponent(id, size),
      badge &&
        createElement(
          'span',
          { className: 'text-s absolute -top-2 -right-1' },
          badge,
        ),
    );
  }

  function toSvgString(id: string, size: number): string {
    return provider.toSvgString(id, size);
  }

  function toElement(id: string, size: number): HTMLElement {
    const container = document.createElement('div');
    container.innerHTML = provider.toSvgString(id, size);
    return container;
  }

  return {
    Avatar,
    toSvgString,
    toElement,
  };
}

/**
 * CodeMirror Gutter 등 React 외부 환경에서 아바타 DOM을 생성
 */
export function createAvatarElement(
  provider: AvatarProvider,
  id: string,
  size: number,
): HTMLElement {
  const container = document.createElement('div');

  container.style.width = `${size}px`;
  container.style.height = `${size}px`;
  container.style.minWidth = `${size}px`;
  container.style.minHeight = `${size}px`;
  container.style.flex = 'none';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';

  const svgString = provider.toSvgString(id, size);
  container.innerHTML = svgString;

  const svg = container.querySelector('svg');
  if (svg) {
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.display = 'block';
  }

  return container;
}
