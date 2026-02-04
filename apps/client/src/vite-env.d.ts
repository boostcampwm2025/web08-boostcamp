/// <reference types="vite/client" />

declare module '*.svg?react' {
  import type { FunctionComponent, SVGProps } from 'react';
  const content: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default content;
}
