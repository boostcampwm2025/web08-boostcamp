import { memo } from "react";
import { usePt } from "@/stores/pts";
import { ParticipantAvatar, ParticipantMenu } from "./ui";
import { ParticipantInfo } from "./ParticipantInfo";
import type { ParticipantProps } from "./types";

export const Participant = memo(({ ptId }: ParticipantProps) => {
  const pt = usePt(ptId);
  if (!pt) return null;

  const isOnline = pt.presence === "online";
  const opacity = isOnline ? "opacity-100" : "opacity-40";

  return (
    <div
      className="flex items-center justify-between p-2 transition-colors
        select-none hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      <div className={`flex items-center space-x-3 ${opacity}`}>
        <ParticipantAvatar ptId={ptId} />
        <ParticipantInfo ptId={ptId} />
      </div>
      <ParticipantMenu />
    </div>
  );
});

Participant.displayName = "Participant";
