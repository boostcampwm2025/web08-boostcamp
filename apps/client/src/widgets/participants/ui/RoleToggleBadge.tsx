import { Badge } from "@codejam/ui";
import type { PtRole } from "@codejam/common";
import { cn } from "@codejam/ui";
import { ROLE_BADGE_STYLES } from "../lib/types";

export interface RoleToggleBadgeProps {
  role: PtRole;
  mode: "hostClaim" | "roleToggle" | "static";
  isEditor?: boolean;
  onToggle?: () => void;
  onHostClaim?: () => void;
  displayText?: string;
}

export function RoleToggleBadge({
  role,
  mode,
  isEditor,
  onToggle,
  onHostClaim,
  displayText,
}: RoleToggleBadgeProps) {
  if (mode === "static") {
    return (
      <Badge className={ROLE_BADGE_STYLES[role]}>
        <span className="relative mr-1 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
        {displayText || role.toUpperCase()}
      </Badge>
    );
  }

  const isRight = mode === "roleToggle" && isEditor;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === "hostClaim") {
      onHostClaim?.();
    } else {
      onToggle?.();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative flex h-6 w-24 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200",
        ROLE_BADGE_STYLES[role]
      )}
    >
      <div
        className={cn(
          "absolute flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 ease-out",
          isRight ? "translate-x-[calc(100%-2px)]" : "translate-x-0.5"
        )}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      </div>

      <div className="flex w-full justify-between px-2">
        <span
          className={cn(
            "z-10 text-[10px] font-bold uppercase transition-opacity duration-200 select-none",
            !isRight ? "opacity-100" : "opacity-50"
          )}
        >
          {mode === "hostClaim" ? (displayText || role.toUpperCase()) : "VIEWER"}
        </span>

        <span
          className={cn(
            "z-10 text-[10px] font-bold uppercase transition-opacity duration-200 select-none",
            isRight ? "opacity-100" : "opacity-50"
          )}
        >
          {mode === "hostClaim" ? "HOST" : "EDITOR"}
        </span>
      </div>
    </div>
  );
}
