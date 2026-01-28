import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Cat,
  Dog,
  Rabbit,
  Fish,
  Bird,
  Turtle,
  Bug,
  Ghost,
  Smile,
  Heart,
  Bot,
  Gamepad2,
} from 'lucide-react';
import type { ElementType } from 'react';
import { type AvatarProvider } from './avatar-generator.js';

const AVATAR_ICONS = [
  Cat,
  Dog,
  Rabbit,
  Bird,
  Fish,
  Turtle,
  Bug,
  Bot,
  Ghost,
  Smile,
  Gamepad2,
  Heart,
] as const;

const DEFAULT_COLOR = '#808080';

/**
 * id를 기반으로 아이콘을 선택
 */
export function getAvatarIcon(id: string | null | undefined): ElementType {
  if (!id) return AVATAR_ICONS[0];

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }

  return AVATAR_ICONS[hash % AVATAR_ICONS.length];
}

export class LucideAvatarProvider implements AvatarProvider {
  createComponent(id: string, size: number, color?: string): ReactNode {
    const Icon = getAvatarIcon(id);
    const bgColor = color ?? DEFAULT_COLOR;
    const iconSize = Math.floor(size * 0.6);

    return createElement(
      'div',
      {
        className:
          'flex h-full w-full items-center justify-center rounded-full text-white shadow-sm transition-transform hover:scale-105',
        style: { backgroundColor: bgColor, width: size, height: size },
      },
      createElement(Icon, { size: iconSize, strokeWidth: 2.5 }),
    );
  }

  toSvgString(id: string, size: number, color?: string): string {
    const Icon = getAvatarIcon(id);
    const bgColor = color ?? DEFAULT_COLOR;

    // Lucide 아이콘을 SVG 문자열로 변환 (기본 viewBox 24x24)
    const iconHtml = renderToStaticMarkup(
      createElement(Icon, {
        size: 24,
        strokeWidth: 2.5,
        stroke: 'white',
      }),
    );

    // SVG 내부 요소만 추출 (path, line, circle, polyline 등)
    const innerContent = iconHtml
      .replace(/<svg[^>]*>/, '')
      .replace(/<\/svg>/, '');

    // 새 SVG 조립: viewBox 24 기준 (Lucide 원본), 배경 원 + 아이콘
    const svg = `<svg viewBox="0 0 24 24" fill="none" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="${bgColor}"/>
      <g stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(4.8, 4.8) scale(0.6)">
        ${innerContent}
      </g>
    </svg>`;

    return svg;
  }
}
