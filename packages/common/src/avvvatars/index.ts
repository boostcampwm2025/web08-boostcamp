import randomNumber from './random';
import { BACKGROUND_COLORS, TEXT_COLORS, SHAPE_COLORS } from './colors';

export interface AvatarColors {
  shapeIndex: number;
  colorIndex: number;
  background: string;
  text: string;
  shape: string;
}

export function getAvatarColors(value: string): AvatarColors {
  // Generate unique random for given value
  // There are 20 colors in array so generate between 0 and 19
  const colorIndex = randomNumber({ value, min: 0, max: 19 });
  // There are 60 shapes so generate between 1 and 60
  const shapeIndex = randomNumber({ value, min: 1, max: 60 });

  return {
    shapeIndex,
    colorIndex,
    background: BACKGROUND_COLORS[colorIndex],
    text: TEXT_COLORS[colorIndex],
    shape: SHAPE_COLORS[colorIndex],
  };
}

export { BACKGROUND_COLORS, TEXT_COLORS, SHAPE_COLORS };
