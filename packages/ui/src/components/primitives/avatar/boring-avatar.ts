import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Avatar from 'boring-avatars';
import { type AvatarProvider } from './avatar-generator.js';

export const DEFAULT_BORING_AVATAR_COLORS = [
  '#92A1C6',
  '#146A7C',
  '#F0AB3D',
  '#C271B4',
  '#C20D90',
];

export type BoringAvatarVariant =
  | 'marble'
  | 'beam'
  | 'pixel'
  | 'sunset'
  | 'ring'
  | 'bauhaus';

export interface BoringAvatarOptions {
  colors?: string[];
  variant?: BoringAvatarVariant;
}

export class BoringAvatarProvider implements AvatarProvider {
  private colors: string[];
  private variant: BoringAvatarVariant;

  constructor(options: BoringAvatarOptions = {}) {
    this.colors = options.colors ?? DEFAULT_BORING_AVATAR_COLORS;
    this.variant = options.variant ?? 'beam';
  }

  createComponent(id: string, size: number): ReactNode {
    return createElement(Avatar, {
      name: id,
      size,
      colors: this.colors,
      variant: this.variant,
    });
  }

  toSvgString(id: string, size: number): string {
    return renderToStaticMarkup(
      createElement(Avatar, {
        name: id,
        size,
        colors: this.colors,
        variant: this.variant,
      }),
    );
  }
}
