export interface CardColorScheme {
  iconBg: string;
  iconColor: string;
  hoverRing: string;
}

const blue: CardColorScheme = {
  iconBg: 'bg-brand-blue/10',
  iconColor: 'text-brand-blue',
  hoverRing: 'hover:ring-brand-blue/30',
};

const green: CardColorScheme = {
  iconBg: 'bg-brand-green/10',
  iconColor: 'text-brand-green',
  hoverRing: 'hover:ring-brand-green/30',
};

const purple: CardColorScheme = {
  iconBg: 'bg-brand-purple/10',
  iconColor: 'text-brand-purple',
  hoverRing: 'hover:ring-brand-purple/30',
};

const orange: CardColorScheme = {
  iconBg: 'bg-brand-orange/10',
  iconColor: 'text-brand-orange',
  hoverRing: 'hover:ring-brand-orange/30',
};

const red: CardColorScheme = {
  iconBg: 'bg-brand-red/10',
  iconColor: 'text-brand-red',
  hoverRing: 'hover:ring-brand-red/30',
};

export const cardColorSchemes: Record<string, CardColorScheme> = {
  blue,
  green,
  purple,
  orange,
  red,
} as const;
