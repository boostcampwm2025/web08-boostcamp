import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { cardColorSchemes } from "../constants/card-color-schemes";

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  colorKey: string;
  onClick?: () => void;
}

export function ActionCard({
  icon: Icon,
  title,
  description,
  colorKey,
  onClick,
}: ActionCardProps) {
  const colors = cardColorSchemes[colorKey];

  return (
    <Card
      className={`cursor-pointer bg-gray-50 border-gray-200 ${colors.hoverCardBg} ${colors.hoverBorderColor} hover:shadow-sm transition-all duration-150 shadow-none`}
      onClick={onClick}
    >
      <CardHeader className="pb-4">
        <div
          className={`${colors.iconBg} border ${colors.borderColor} w-12 h-12 mb-2 rounded-sm flex items-center justify-center`}
        >
          <Icon className={`h-6 w-6 ${colors.iconColor}`} />
        </div>
        <CardTitle className="text-xl text-gray-800">{title}</CardTitle>
        <CardDescription className="text-gray-600 text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
