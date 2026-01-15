export interface CardColorScheme {
  cardBg: string;
  iconBg: string;
  borderColor: string;
  iconColor: string;
  hoverCardBg: string;
  hoverBorderColor: string;
}

const blue: CardColorScheme = {
  cardBg: 'bg-blue-50',
  iconBg: 'bg-blue-100',
  borderColor: 'border-blue-200',
  iconColor: 'text-blue-500',
  hoverCardBg: 'hover:bg-blue-50',
  hoverBorderColor: 'hover:border-blue-400',
};

const green: CardColorScheme = {
  cardBg: 'bg-green-50',
  iconBg: 'bg-green-100',
  borderColor: 'border-green-200',
  iconColor: 'text-green-500',
  hoverCardBg: 'hover:bg-green-50',
  hoverBorderColor: 'hover:border-green-400',
};

const purple: CardColorScheme = {
  cardBg: 'bg-purple-50',
  iconBg: 'bg-purple-100',
  borderColor: 'border-purple-200',
  iconColor: 'text-purple-500',
  hoverCardBg: 'hover:bg-purple-50',
  hoverBorderColor: 'hover:border-purple-400',
};

const orange: CardColorScheme = {
  cardBg: 'bg-orange-50',
  iconBg: 'bg-orange-100',
  borderColor: 'border-orange-200',
  iconColor: 'text-orange-500',
  hoverCardBg: 'hover:bg-orange-50',
  hoverBorderColor: 'hover:border-orange-400',
};

const red: CardColorScheme = {
  cardBg: 'bg-red-50',
  iconBg: 'bg-red-100',
  borderColor: 'border-red-200',
  iconColor: 'text-red-500',
  hoverCardBg: 'hover:bg-red-50',
  hoverBorderColor: 'hover:border-red-400',
};

export const cardColorSchemes: Record<string, CardColorScheme> = {
  blue,
  green,
  purple,
  orange,
  red,
} as const;
