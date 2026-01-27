import { type ReactNode } from 'react';

export interface AvatarProvider {
  createComponent(id: string, size: number): ReactNode;
  toSvgString(id: string, size: number): string;
}

export interface AvatarProps {
  id: string;
  badge?: ReactNode;
  size?: number;
  className?: string;
}

export function createAvatarGenerator(provider: AvatarProvider) {
  function Avatar({ id, badge, size = 40, className = '' }: AvatarProps) {
    return (
      <div className={`relative ${className}`}>
        {provider.createComponent(id, size)}
        {badge && (
          <span className="text-s absolute -top-2 -right-1">{badge}</span>
        )}
      </div>
    );
  }

  function toElement(id: string, size: number): HTMLElement {
    const container = document.createElement('div');
    container.innerHTML = provider.toSvgString(id, size);
    return container;
  }

  return {
    Avatar,
    toElement,
  };
}
