import BombIcon from '@/assets/fa-bomb.svg?react';
import { DestroyRoomDialog } from '@/widgets/dialog/DestroyRoomDialog';
import { Button } from '@codejam/ui';
import { PERMISSION } from '@codejam/common';
import { usePermission } from '@/shared/lib/hooks/usePermission';

export function DestroyRoomButton() {
  const { can } = usePermission();

  if (!can(PERMISSION.DESTROY_ROOM)) return null;

  return (
    <DestroyRoomDialog>
      <Button size="icon-sm" variant="destructive" title={'방 폭파하기'}>
        <BombIcon />
      </Button>
    </DestroyRoomDialog>
  );
}
