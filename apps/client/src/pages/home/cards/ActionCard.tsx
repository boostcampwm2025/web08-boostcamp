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
    <Card className="bg-gray-50 border-gray-200 shadow-none">
      <CardHeader className="pb-4 flex flex-col items-center text-center">
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
      <CardContent className="flex flex-col items-center justify-center">
        {children}
      </CardContent>
    </Card>
  );
}
