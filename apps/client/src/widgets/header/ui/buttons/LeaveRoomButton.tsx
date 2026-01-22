import { useState } from 'react';
import { DoorOpen } from 'lucide-react';
import { LeaveRoomDialog } from '@/widgets/dialog/LeaveRoomDialog';
import { emitLeftRoom } from '@/stores/socket-events/room';
import { HeaderActionButton } from './HeaderActionButton';

export function LeaveRoomButton() {
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  const handleLeaveRoom = () => {
    emitLeftRoom();
  };

  return (
    <>
      <HeaderActionButton onClick={() => setIsLeaveDialogOpen(true)}>
        <DoorOpen className="h-4 w-4" />
        <span className="hidden lg:inline">Leave</span>
      </HeaderActionButton>

      <LeaveRoomDialog
        open={isLeaveDialogOpen}
        onOpenChange={setIsLeaveDialogOpen}
        onConfirm={handleLeaveRoom}
      />
    </>
  );
}
