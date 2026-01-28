export * from './card';
export * from './label';
export * from './textarea';
export * from './menu-button';

// Legacy avatar (Lucide icons 기반)
export * from './avatar/avatar';
export { getAvatarIcon } from './avatar/avatar-shared';
export { createAvatarElement } from './avatar/avatar-dom';

// New avatar system (라이브러리 교체 가능)
export {
  createAvatarGenerator,
  type AvatarProvider,
  type AvatarProps,
} from './avatar/avatar-generator.js';
export {
  BoringAvatarProvider,
  DEFAULT_BORING_AVATAR_COLORS,
  type BoringAvatarVariant,
  type BoringAvatarOptions,
} from './avatar/boring-avatar';
export {
  AvvvatarsProvider,
  type AvvvatarsVariant,
  type AvvvatarsOptions,
} from './avatar/avvvatars-avatar';
