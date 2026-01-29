import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Avvvatars from './avvvatars/avvvatars.js';
import { getAvatarColors } from '@codejam/common/avvvatars';
import { type AvatarProvider } from './avatar-generator.js';

export type AvvvatarsVariant = 'shape' | 'character';

export interface AvvvatarsOptions {
  colors?: string[];
  variant?: AvvvatarsVariant;
}

export class AvvvatarsProvider implements AvatarProvider {
  private variant: AvvvatarsVariant;

  constructor(options: AvvvatarsOptions = {}) {
    this.variant = options.variant ?? 'shape';
    // Note: avvvatars는 colors를 지원하지 않음 (내부적으로 고정된 팔레트 사용)
  }

  createComponent(id: string, size: number): ReactNode {
    return createElement(Avvvatars, {
      value: id,
      size,
      variant: this.variant,
    });
  }

  toSvgString(id: string, size: number): string {
    const html = renderToStaticMarkup(
      createElement(Avvvatars, {
        value: id,
        size,
        variant: this.variant,
      }),
    );

    // 색상 정보 가져오기
    const colors = getAvatarColors(id);
    const bgColor = colors.background;
    const fgColor =
      this.variant === 'character' ? colors.text : colors.shape;

    if (this.variant === 'character') {
      // Character 모드: 배경 원 + 텍스트
      const name = String(id).substring(0, 2).toUpperCase();
      const fontSize = Math.round((size / 100) * 37);

      const svg = `<svg viewBox="0 0 32 32" fill="none" width="${size}" height="${size}">
        <circle cx="16" cy="16" r="16" fill="${bgColor}"/>
        <text x="16" y="16" text-anchor="middle" dominant-baseline="central" fill="${fgColor}" font-family="-apple-system, BlinkMacSystemFont, Inter, Segoe UI, Roboto, sans-serif" font-size="${fontSize}" font-weight="500" style="text-transform: uppercase;">${name}</text>
      </svg>`;

      return svg;
    } else {
      // Shape 모드: 배경 원 + 아이콘
      // 아이콘 path 추출 (원본 viewBox는 항상 32x32)
      const pathMatch = html.match(/<path[^>]*d="([^"]+)"[^>]*>/);
      const pathD = pathMatch ? pathMatch[1] : '';

      // clipPath 추출 (일부 shape에서 사용)
      const clipPathMatch = html.match(/<clipPath[^>]*>([\s\S]*?)<\/clipPath>/);
      const hasClipPath = !!clipPathMatch;

      const svg = `<svg viewBox="0 0 32 32" fill="none" width="${size}" height="${size}">
        <circle cx="16" cy="16" r="16" fill="${bgColor}"/>
        <g transform="translate(6.4, 6.4) scale(0.6)">
          ${hasClipPath ? `<defs>${clipPathMatch[0]}</defs>` : ''}
          ${hasClipPath ? `<g clip-path="url(#clip0_1_4196)">` : ''}
          <path d="${pathD}" fill="${fgColor}"/>
          ${hasClipPath ? '</g>' : ''}
        </g>
      </svg>`;

      return svg;
    }
  }
}
