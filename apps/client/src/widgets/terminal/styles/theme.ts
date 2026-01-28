import type { ITheme } from 'xterm';

const LIGHT_THEME: ITheme = {
  background: '#ffffff',
  foreground: '#383a42',
  cursor: '#383a42',
  selectionBackground: '#d7dae0',
  selectionForeground: '#383a42',
  black: '#000000',
  red: '#e45649',
  green: '#50a14f',
  yellow: '#c18401',
  blue: '#0184bc',
  magenta: '#a626a4',
  cyan: '#0997b3',
  white: '#fafafa',
  brightBlack: '#4f525e',
  brightRed: '#e06c75',
  brightGreen: '#98c379',
  brightYellow: '#e5c07b',
  brightBlue: '#61afef',
  brightMagenta: '#c678dd',
  brightCyan: '#56b6c2',
  brightWhite: '#ffffff',
};

const DARK_THEME: ITheme = {
  background: '#1e1e1e',
  foreground: '#d4d4d4',
  cursor: '#ffffff',
  selectionBackground: '#3a3d41',
  selectionForeground: '#ffffff',
  black: '#000000',
  red: '#cd3131',
  green: '#0dbc79',
  yellow: '#e5e510',
  blue: '#2472c8',
  magenta: '#bc3fbc',
  cyan: '#11a8cd',
  white: '#e5e5e5',
  brightBlack: '#666666',
  brightRed: '#f14c4c',
  brightGreen: '#23d18b',
  brightYellow: '#f5f543',
  brightBlue: '#3b8eea',
  brightMagenta: '#d670d6',
  brightCyan: '#29b8db',
  brightWhite: '#ffffff',
};

export const themes = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
};

export type TerminalVariant = keyof typeof themes;
export const getTheme = (variant: TerminalVariant): ITheme => themes[variant];
