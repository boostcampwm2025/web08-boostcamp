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

const AVATAR_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
  '#F8B500',
] as const; // 11개 (12와 서로소)

/**
 * id를 기반으로 아바타 프리셋(아이콘 + 색상)을 선택
 * 아이콘 12개, 색상 11개로 서로소 관계 → 132가지 조합 (모두 다른 쌍)
 */
export function getAvatarPreset(id: string | null | undefined): {
  icon: ElementType;
  color: string;
} {
  if (!id) return { icon: AVATAR_ICONS[0], color: AVATAR_COLORS[0] };

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }

  const icon = AVATAR_ICONS[hash % AVATAR_ICONS.length];
  const color = AVATAR_COLORS[hash % AVATAR_COLORS.length];

  return { icon, color };
}

export class LucideAvatarProvider implements AvatarProvider {
  createComponent(id: string, size: number): ReactNode {
    const { icon: Icon, color } = getAvatarPreset(id);
    const iconSize = Math.floor(size * 0.6);

    return createElement(
      'div',
      {
        className:
          'flex h-full w-full items-center justify-center rounded-full text-white shadow-sm transition-transform hover:scale-105',
        style: { backgroundColor: color, width: size, height: size },
      },
      createElement(Icon, { size: iconSize, strokeWidth: 2.5 }),
    );
  }

  toSvgString(id: string, size: number): string {
    const { icon: Icon, color } = getAvatarPreset(id);

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
    // avvvatars처럼 배경과 아이콘 분리
    const svg = `<svg viewBox="0 0 24 24" fill="none" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="${color}"/>
      <g stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(4.8, 4.8) scale(0.6)">
        ${innerContent}
      </g>
    </svg>`;

    return svg;
  }
}
