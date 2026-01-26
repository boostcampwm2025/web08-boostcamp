import type { LucideIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { cardColorSchemes } from '../constants/card-color-schemes';

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  colorKey: string;
  children?: React.ReactNode;
}

export function ActionCard({
  icon: Icon,
  title,
  description,
  colorKey,
  children,
}: ActionCardProps) {
  const colors = cardColorSchemes[colorKey];

  return (
    <Card
      className={`group relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-lg shadow-gray-200/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gray-200/50 ${colors.hoverBorderColor} `}
    >
      <div
        className={`absolute -top-10 -right-10 h-40 w-40 bg-gradient-to-br ${colors.iconBg} pointer-events-none rounded-full to-transparent opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100`}
      />

      <CardHeader className="relative z-10 flex flex-col items-center gap-6 pt-12 pb-2 text-center">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-[1rem] transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${colors.iconBg} shadow-inner ring-1 ring-black/5`}
        >
          <Icon className={`h-6 w-6 ${colors.iconColor}`} />
        </div>

        <div className="space-y-3 px-2">
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
            {title}
          </CardTitle>
          <CardDescription className="text-base leading-relaxed font-medium break-keep text-gray-500">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 flex w-full flex-col items-center justify-center px-8 pt-6 pb-10">
        {children}
      </CardContent>
    </Card>
  );
}
