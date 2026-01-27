import { AVATAR_BASE_CLASSES, getAvatarIcon } from './avatar-shared';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * CodeMirror Gutter 등 React 외부 환경에서 아바타 DOM을 생성
 */
export function createAvatarElement(
  ptHash: string,
  color: string,
  size: number,
): HTMLElement {
  const container = document.createElement('div');

  // 기본 클래스 적용
  container.className = AVATAR_BASE_CLASSES;

  // 동적 스타일 적용 (크기, 배경색)
  container.style.backgroundColor = color;
  container.style.width = `${size}px`;
  container.style.height = `${size}px`;
  container.style.minWidth = `${size}px`;
  container.style.minHeight = `${size}px`;
  container.style.flex = 'none';

  // ptHash로 아이콘 선택 후 SVG로 변환
  const IconComponent = getAvatarIcon(ptHash);
  const iconSize = Math.floor(size * 0.6);

  const svgString = renderToStaticMarkup(
    createElement(IconComponent, {
      size: iconSize,
      strokeWidth: 2.5,
    }),
  );

  container.innerHTML = svgString;

  return container;
}
