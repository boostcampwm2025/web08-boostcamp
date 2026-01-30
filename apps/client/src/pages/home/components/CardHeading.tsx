import type { LucideIcon } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '@codejam/ui';
import { cardColorSchemes } from '../constants/card-color-schemes';

interface CardHeadingProps {
  icon: LucideIcon;
  title: string;
  description: string;
  colorKey: string;
}

export function CardHeading({
  icon: Icon,
  title,
  description,
  colorKey,
}: CardHeadingProps) {
  const colors = cardColorSchemes[colorKey];

  return (
    <CardHeader className="flex flex-col items-center gap-6 pt-12 pb-2 text-center">
      <div
        className={`flex size-12 items-center justify-center rounded-2xl ${colors.iconBg}`}
      >
        <Icon className={`size-6 ${colors.iconColor}`} />
      </div>

      <div className="space-y-3">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {title}
        </CardTitle>
        <CardDescription className="text-base leading-relaxed break-keep">
          {description}
        </CardDescription>
      </div>
    </CardHeader>
  );
}
