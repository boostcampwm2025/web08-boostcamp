import type { LucideIcon } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
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
    <Card
      className="
        bg-white border-gray-100 shadow-sm rounded-2xl 
        transition-all duration-300 
        hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 hover:border-gray-200
        group
      "
    >
      <CardHeader className="flex flex-col items-center text-center gap-4 py-8 px-6">
        <div
          className={`
            w-14 h-14 rounded-2xl flex items-center justify-center mb-1
            transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
            ${colors.iconBg} 
          `}
        >
          <Icon className={`h-7 w-7 ${colors.iconColor}`} />
        </div>

        <div className="space-y-2">
          <CardTitle className="text-lg font-bold text-gray-900">
            {title}
          </CardTitle>
          <CardDescription className="text-gray-500 text-sm font-medium leading-relaxed break-keep">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
