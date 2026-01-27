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
    <Card className="group rounded-2xl border border-gray-100 bg-white shadow-sm ring-0 transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-200/50">
      <CardHeader className="flex flex-col items-center gap-4 px-6 py-8 text-center">
        <div
          className={`mb-1 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${colors.iconBg} `}
        >
          <Icon className={`h-7 w-7 ${colors.iconColor}`} />
        </div>

        <div className="space-y-2">
          <CardTitle className="text-lg font-bold text-gray-900">
            {title}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed font-medium break-keep text-gray-500">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
