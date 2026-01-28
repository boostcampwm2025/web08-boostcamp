export * from './card';
export * from './label';
export * from './textarea';
export * from './menu-button';

// Avatar system (Provider 패턴)
export {
  createAvatarGenerator,
  createAvatarElement,
  type AvatarProvider,
  type GeneratedAvatarProps,
} from './avatar/avatar-generator.js';

// Providers
export {
  BoringAvatarProvider,
  DEFAULT_BORING_AVATAR_COLORS,
  type BoringAvatarVariant,
  type BoringAvatarOptions,
} from './avatar/boring-avatar.js';

export {
  AvvvatarsProvider,
  type AvvvatarsVariant,
  type AvvvatarsOptions,
} from './avatar/avvvatars-avatar.js';

export { LucideAvatarProvider, getAvatarIcon } from './avatar/lucide-avatar.js';
