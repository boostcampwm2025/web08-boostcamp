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
      className={`
        relative overflow-hidden 
        bg-white 
        border border-gray-100 
        shadow-lg shadow-gray-200/40 
        rounded-[2rem] 
        transition-all duration-300 
        group
        hover:-translate-y-1 
        hover:shadow-2xl hover:shadow-gray-200/50
        ${colors.hoverBorderColor} 
      `}
    >
      <div
        className={`
          absolute -top-10 -right-10 w-40 h-40 
          bg-gradient-to-br ${colors.iconBg} to-transparent 
          opacity-0 group-hover:opacity-100 
          blur-3xl rounded-full 
          transition-opacity duration-500 pointer-events-none
        `}
      />

      <CardHeader className="pb-2 flex flex-col items-center text-center gap-6 pt-12 relative z-10">
        <div
          className={`
            w-12 h-12 
            rounded-[1rem] 
            flex items-center justify-center 
            transition-all duration-300 
            group-hover:scale-110 group-hover:rotate-3 
            ${colors.iconBg} 
            ring-1 ring-black/5 shadow-inner
          `}
        >
          <Icon className={`h-6 w-6 ${colors.iconColor}`} />
        </div>

        <div className="space-y-3 px-2">
          <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">
            {title}
          </CardTitle>
          <CardDescription className="text-gray-500 text-base font-medium leading-relaxed break-keep">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pb-10 px-8 pt-6 relative z-10 w-full">
        {children}
      </CardContent>
    </Card>
  );
}
