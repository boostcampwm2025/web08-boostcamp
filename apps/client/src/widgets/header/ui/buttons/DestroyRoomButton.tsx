import { Bomb } from 'lucide-react';
import { DestroyRoomDialog } from '@/widgets/dialog/DestroyRoomDialog';
import { useRoomStore } from '@/stores/room';
import { usePt } from '@/stores/pts';
import { HeaderActionButton } from './HeaderActionButton';

export function DestroyRoomButton() {
  const { myPtId, whoCanDestroyRoom } = useRoomStore();
  const myPt = usePt(myPtId);

  const canDestroyRoom = myPt?.role === whoCanDestroyRoom;
  if (!canDestroyRoom) return null;

  return (
    <DestroyRoomDialog>
      <HeaderActionButton className="text-destructive hover:text-destructive">
        <Bomb className="h-4 w-4" />
        <span className="hidden lg:inline">Destroy</span>
      </HeaderActionButton>
    </DestroyRoomDialog>
  );
}
