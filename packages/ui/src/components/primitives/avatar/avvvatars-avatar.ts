import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Avvvatars from 'avvvatars-react';
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
      style: this.variant,
    });
  }

  toSvgString(id: string, size: number): string {
    const html = renderToStaticMarkup(
      createElement(Avvvatars, {
        value: id,
        size,
        style: this.variant,
      }),
    );

    // 배경색 추출 (div의 color 속성)
    const bgColorMatch = html.match(/<div[^>]*color="([^"]+)"/);
    const bgColor = bgColorMatch ? `#${bgColorMatch[1]}` : '#ECFAFE';

    // 전경색 추출 (span의 color 속성)
    const fgColorMatch = html.match(/<span[^>]*color="([^"]+)"/);
    const fgColor = fgColorMatch ? `#${fgColorMatch[1]}` : '#0FBBE6';

    // 아이콘 path 추출 (원본 viewBox는 항상 32x32)
    const pathMatch = html.match(/<path[^>]*><\/path>/);
    const iconPath = pathMatch
      ? pathMatch[0].replace(/fill="currentColor"/, `fill="${fgColor}"`)
      : '';

    // 새 SVG 조립: viewBox 32 기준, 배경 원 + 아이콘 (60% 크기로 가운데)
    const svg = `<svg viewBox="0 0 32 32" fill="none" width="${size}" height="${size}">
      <circle cx="16" cy="16" r="16" fill="${bgColor}"/>
      <g transform="translate(6.4, 6.4) scale(0.6)">
        ${iconPath}
      </g>
    </svg>`;

    return svg;
  }
}
