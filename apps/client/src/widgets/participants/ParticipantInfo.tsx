import { usePt } from "@/stores/pts";
import { useRoomStore } from "@/stores/room";
import { ROLE_TEXT_COLORS, getRoleDisplayText } from "./types";
import type { ParticipantProps } from "./types";

export function ParticipantInfo({ ptId }: ParticipantProps) {
  const pt = usePt(ptId);
  const myPtId = useRoomStore((state) => state.myPtId);

  if (!pt) return null;

  const { nickname, ptHash, role } = pt;
  const roleText = getRoleDisplayText(role);
  const roleTextColor = ROLE_TEXT_COLORS[role];
  const isMe = myPtId === ptId;

  return (
    <div>
      <div className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-100">
        {nickname}
        {ptHash && (
          <span className="ml-1 text-gray-500 dark:text-gray-400">
            #{ptHash}
          </span>
        )}
        {isMe && (
          <span className="ml-1.5 text-xs font-normal text-gray-500 dark:text-gray-400">
            (You)
          </span>
        )}
      </div>
      <div className="text-xs font-medium" style={{ color: roleTextColor }}>
        {roleText}
      </div>
    </div>
  );
}
