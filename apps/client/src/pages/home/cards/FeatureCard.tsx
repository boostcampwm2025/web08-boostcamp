import type { LucideIcon } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  colorScheme: "blue" | "green" | "purple" | "orange" | "red";
}

const colorClasses = {
  blue: {
    cardBg: "bg-blue-50",
    iconBg: "bg-blue-100",
    borderColor: "border-blue-200",
    iconColor: "text-blue-500",
  },
  green: {
    cardBg: "bg-green-50",
    iconBg: "bg-green-100",
    borderColor: "border-green-200",
    iconColor: "text-green-500",
  },
  purple: {
    cardBg: "bg-purple-50",
    iconBg: "bg-purple-100",
    borderColor: "border-purple-200",
    iconColor: "text-purple-500",
  },
  orange: {
    cardBg: "bg-orange-50",
    iconBg: "bg-orange-100",
    borderColor: "border-orange-200",
    iconColor: "text-orange-500",
  },
  red: {
    cardBg: "bg-red-50",
    iconBg: "bg-red-100",
    borderColor: "border-red-200",
    iconColor: "text-red-500",
  },
};

export function FeatureCard({
  icon: Icon,
  title,
  description,
  colorScheme,
}: FeatureCardProps) {
  const colors = colorClasses[colorScheme];

  return (
    <Card className={`border-transparent shadow-none ${colors.cardBg}`}>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`${colors.iconBg} border ${colors.borderColor} w-10 h-10 rounded-sm flex items-center justify-center`}
          >
            <Icon className={`h-5 w-5 ${colors.iconColor}`} />
          </div>
        </div>
        <CardTitle className="text-base text-gray-800">{title}</CardTitle>
        <CardDescription className="text-gray-600 text-xs font-mono">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
