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

/**
 * 아바타의 기본 Tailwind 클래스
 */
export const AVATAR_BASE_CLASSES =
  'relative rounded-full flex items-center justify-center text-white shadow-sm transition-transform hover:scale-105';

/**
 * 사용할 아이콘 목록
 */
export const AVATAR_ICONS = [
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

/**
 * ptHash를 기반으로 아이콘을 선택하는 함수
 * @param ptHash 사용자의 고유 해시값
 * @returns 선택된 Lucide 아이콘 컴포넌트
 */
export function getAvatarIcon(ptHash: string | null | undefined): ElementType {
  if (!ptHash) return AVATAR_ICONS[0];

  let hash = 0;
  for (let i = 0; i < ptHash.length; i++) {
    hash = (hash * 31 + ptHash.charCodeAt(i)) >>> 0;
  }

  return AVATAR_ICONS[hash % AVATAR_ICONS.length];
}
