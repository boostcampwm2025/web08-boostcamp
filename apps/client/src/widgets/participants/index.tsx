import { useEffect, useMemo, useState } from "react";
import { Participant } from "./Participant";
import { sorter } from "./sorter";
import { usePtsStore } from "@/stores/pts";
import { checkHost } from "@/shared/api/room";
import { useParams } from "react-router-dom";
import { ptStorage } from "@/shared/lib/storage";

export function Participants() {
  const pts = usePtsStore((state) => state.pts);
  const { roomCode } = useParams();
  const myPtId = ptStorage.myId(roomCode);
  const sorted = useMemo(() => Object.values(pts).sort(sorter), [pts]);
  const [ hasPermission, setHasPermission ] = useState(false);
  const count = sorted.length;

  useEffect(() => {
    const localPermission = async () => {
      const permission = await checkHost(roomCode || "", myPtId || "");
      setHasPermission(permission);
    };

    localPermission();
  }, []);

  return (
    <div className="w-full min-w-3xs bg-white dark:bg-gray-800 p-4 font-sans">
      <h2 className="text-sm font-bold uppercase text-gray-700 dark:text-gray-200 border-b pb-2 mb-2">
        PARTICIPANTS ({count})
      </h2>

      <div className="space-y-1 mt-4">
        {sorted.map((p) => (
          <Participant key={p.ptId} ptId={p.ptId} hasPermission={hasPermission} />
        ))}
      </div>
    </div>
  );
}

// Re-export components only (for Fast Refresh compatibility)
export { Participant } from "./Participant";
export { ParticipantInfo } from "./ParticipantInfo";
export { ParticipantAvatar, ParticipantMenu } from "./ui";
