import type { LucideIcon } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@codejam/ui';
import { cardColorSchemes } from '../constants/card-color-schemes';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  colorKey: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  colorKey,
}: FeatureCardProps) {
  const colors = cardColorSchemes[colorKey];

  return (
    <li className="group">
      <Card className="ring-accent h-full rounded-2xl border-gray-100 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
        <CardHeader className="flex flex-col items-center gap-4 p-6 text-center">
          <div
            className={`flex size-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${colors.iconBg}`}
          >
            <Icon className={`size-7 ${colors.iconColor}`} />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-lg font-bold">{title}</CardTitle>
            <CardDescription className="break-keep">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </li>
  );
}
