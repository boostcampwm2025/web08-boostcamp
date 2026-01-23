import { useState } from 'react';
import { DoorOpen } from 'lucide-react';
import { HeaderActionButton } from './HeaderActionButton';
import { LeaveRoomDialog } from '@/widgets/dialog/LeaveRoomDialog';
import { emitLeftRoom } from '@/stores/socket-events/room';

export function LeaveRoomButton() {
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  return (
    <>
      <HeaderActionButton onClick={() => setIsLeaveDialogOpen(true)}>
        <DoorOpen className="h-4 w-4" />
        <span className="hidden lg:inline">Leave</span>
      </HeaderActionButton>

      <LeaveRoomDialog
        open={isLeaveDialogOpen}
        onOpenChange={setIsLeaveDialogOpen}
        onConfirm={emitLeftRoom}
      />
    </>
  );
}
