import { Share2 } from 'lucide-react';
import { ShareDialog } from '@/widgets/dialog/ShareDialog';
import { Button } from '@codejam/ui';

export function ShareButton({ roomCode }: { roomCode: string }) {
  return (
    <ShareDialog roomCode={roomCode}>
      <Button size="icon-sm" variant="ghost" title={'방 공유하기'}>
        <Share2 />
      </Button>
    </ShareDialog>
  );
}
