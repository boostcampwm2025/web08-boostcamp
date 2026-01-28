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
    return renderToStaticMarkup(
      createElement(Avvvatars, {
        value: id,
        size,
        style: this.variant,
      }),
    );
  }
}
