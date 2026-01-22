export interface CardColorScheme {
  cardBg: string;
  iconBg: string;
  borderColor: string;
  iconColor: string;
  hoverCardBg: string;
  hoverBorderColor: string;
  accentBg: string;
}

// Blue (방 만들기 - 메인)
const blue: CardColorScheme = {
  cardBg: 'bg-white',
  iconBg: 'bg-brand-blue/10',
  borderColor: 'border-brand-blue/20',
  iconColor: 'text-brand-blue',
  hoverCardBg: 'hover:bg-brand-blue/5',
  hoverBorderColor: 'hover:border-brand-blue/50',
  accentBg: 'bg-brand-blue',
};

// Green (입장하기 - 메인)
const green: CardColorScheme = {
  cardBg: 'bg-white',
  iconBg: 'bg-brand-green/10',
  borderColor: 'border-brand-green/20',
  iconColor: 'text-brand-green',
  hoverCardBg: 'hover:bg-brand-green/5',
  hoverBorderColor: 'hover:border-brand-green/50',
  accentBg: 'bg-brand-green',
};

// Purple (보안/설정 - 서브)
const purple: CardColorScheme = {
  cardBg: 'bg-white',
  iconBg: 'bg-brand-purple/10',
  borderColor: 'border-brand-purple/20',
  iconColor: 'text-brand-purple',
  hoverCardBg: 'hover:bg-brand-purple/5',
  hoverBorderColor: 'hover:border-brand-purple/50',
  accentBg: 'bg-brand-purple',
};

// Orange (기능: 언어/파일)
const orange: CardColorScheme = {
  cardBg: 'bg-white',
  iconBg: 'bg-brand-orange/10',
  borderColor: 'border-brand-orange/20',
  iconColor: 'text-brand-orange',
  hoverCardBg: 'hover:bg-brand-orange/5',
  hoverBorderColor: 'hover:border-brand-orange/50',
  accentBg: 'bg-brand-orange',
};

// Red (기능: 경고/에러 or 강조)
const red: CardColorScheme = {
  cardBg: 'bg-white',
  iconBg: 'bg-brand-red/10',
  borderColor: 'border-brand-red/20',
  iconColor: 'text-brand-red',
  hoverCardBg: 'hover:bg-brand-red/5',
  hoverBorderColor: 'hover:border-brand-red/50',
  accentBg: 'bg-brand-red',
};

export const cardColorSchemes: Record<string, CardColorScheme> = {
  blue,
  green,
  purple,
  orange,
  red,
} as const;
