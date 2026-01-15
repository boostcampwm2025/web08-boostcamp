import { useMemo } from 'react';
import { Participant } from './Participant';
import { sorter } from './sorter';
import { usePt, usePtsStore } from '@/stores/pts';
import { useRoomStore } from '@/stores/room';

export function Participants() {
  const pts = usePtsStore((state) => state.pts);

  const myPtId = useRoomStore((state) => state.myPtId);
  const me = usePt(myPtId);
  const hasPermission = me?.role === 'host';

  const sorted = useMemo(() => Object.values(pts).sort(sorter), [pts]);
  const count = sorted.length;

  return (
    <div className="w-full min-w-3xs bg-white dark:bg-gray-800 p-4 font-sans">
      <h2 className="text-sm font-bold uppercase text-gray-700 dark:text-gray-200 border-b pb-2 mb-2">
        PARTICIPANTS ({count})
      </h2>

      <div className="space-y-1 mt-4">
        {sorted.map((p) => (
          <Participant
            key={p.ptId}
            ptId={p.ptId}
            hasPermission={hasPermission}
          />
        ))}
      </div>
    </div>
  );
}

// Re-export components only (for Fast Refresh compatibility)
export { Participant } from './Participant';
export { ParticipantInfo } from './ParticipantInfo';
export { ParticipantAvatar, ParticipantMenu } from './ui';
