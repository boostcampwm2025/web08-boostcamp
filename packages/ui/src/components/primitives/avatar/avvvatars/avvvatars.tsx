import * as React from 'react';
import { getAvatarColors } from '@codejam/common/avvvatars';
import * as shapes from './shapes';

export type ShapeNames = keyof typeof shapes;

interface ShapeList {
  [key: string]: React.ComponentType<{ width: number }>;
}

export type AvvvatarsVariant = 'character' | 'shape';

export interface AvvvatarsProps {
  value: string;
  displayValue?: string;
  variant?: AvvvatarsVariant;
  size?: number;
  shadow?: boolean;
  border?: boolean;
  borderSize?: number;
  borderColor?: string;
  radius?: number;
  color?: string;
}

const DEFAULTS = {
  variant: 'character' as const,
  size: 32,
  shadow: false,
  border: false,
  borderSize: 2,
  borderColor: '#fff',
};

export default function Avvvatars(props: AvvvatarsProps) {
  const {
    variant = DEFAULTS.variant,
    displayValue,
    value,
    radius,
    size = DEFAULTS.size,
    shadow = DEFAULTS.shadow,
    border = DEFAULTS.border,
    borderSize = DEFAULTS.borderSize,
    borderColor = DEFAULTS.borderColor,
    color,
  } = props;

  // Get colors from common package
  const colors = getAvatarColors(value);

  // Get first two letters for character mode
  const name = String(displayValue || value).substring(0, 2);

  // Background color (allow override via color prop)
  const backgroundColor = color || colors.background;
  const textColor = colors.text;
  const shapeColor = colors.shape;

  // Calculate border radius
  const borderRadius = radius !== undefined ? radius : size;

  // Styles
  const wrapperStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: `${borderRadius}px`,
    backgroundColor: `#${backgroundColor}`,
    border: border ? `${borderSize}px solid ${borderColor}` : undefined,
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    userSelect: 'none',
    boxShadow: shadow
      ? '0px 3px 8px rgba(18, 18, 18, 0.04), 0px 1px 1px rgba(18, 18, 18, 0.02)'
      : undefined,
  };

  const textStyle: React.CSSProperties = {
    margin: 0,
    padding: 0,
    textAlign: 'center',
    boxSizing: 'border-box',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
    fontSize: `${Math.round((size / 100) * 37)}px`,
    color: `#${textColor}`,
    lineHeight: 0,
    textTransform: 'uppercase',
    fontWeight: 500,
  };

  const shapeWrapperStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    verticalAlign: 'middle',
    color: `#${shapeColor}`,
  };

  return (
    <div style={wrapperStyle}>
      {variant === 'character' ? (
        <p style={textStyle}>{name}</p>
      ) : (
        <span style={shapeWrapperStyle}>
          {React.createElement(
            (shapes as ShapeList)[`Shape${colors.shapeIndex}`],
            {
              width: Math.round((size / 100) * 50),
            },
          )}
        </span>
      )}
    </div>
  );
}
