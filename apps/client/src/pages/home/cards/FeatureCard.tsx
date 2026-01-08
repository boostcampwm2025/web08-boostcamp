import type { LucideIcon } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { cardColorSchemes } from "../constants/card-color-schemes";

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
    <Card className={`border-transparent shadow-none ${colors.cardBg}`}>
      <CardHeader className="flex flex-col items-center text-center gap-2">
        <div
          className={`${colors.iconBg} border ${colors.borderColor} w-10 h-10 rounded-full flex items-center justify-center`}
        >
          <Icon className={`h-5 w-5 ${colors.iconColor}`} />
        </div>

        <CardTitle className="text-base text-gray-800">{title}</CardTitle>
        <CardDescription className="text-gray-600 text-xs font-mono">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
