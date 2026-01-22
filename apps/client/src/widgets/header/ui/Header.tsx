import { Button } from '@/shared/ui/button';
import { Bomb } from 'lucide-react';
import { DestroyRoomDialog } from '@/widgets/dialog/DestroyRoomDialog';
import { useRoomStore } from '@/stores/room';
import { usePt } from '@/stores/pts';
import { Logo } from './Logo';
import { RoomCode } from './RoomCode';
import { LeaveRoomButton } from './buttons/LeaveRoomButton';
import { FileUploadButton } from './buttons/FileUploadButton';
import { FileDownloadButton } from './buttons/FileDownloadButton';
import { NewFileButton } from './buttons/NewFileButton';
import { FileCopyButton } from './buttons/FileCopyButton';
import { ShareButton } from './buttons/ShareButton';
import { SettingsButton } from './buttons/SettingsButton';
import { ThemeToggleButton } from './buttons/ThemeToggleButton';

type HeaderProps = {
  roomCode: string;
};

export default function Header({ roomCode }: HeaderProps) {
  // 방 폭파 버튼 조건부 렌더링을 위한 상태
  const { myPtId, whoCanDestroyRoom } = useRoomStore();
  const myPt = usePt(myPtId);
  const canDestroyRoom = myPt?.role === whoCanDestroyRoom;

  return (
    <header className="h-14 bg-background border-b border-border flex items-center px-4 gap-2 sm:gap-4 overflow-x-auto scrollbar-hide">
      <Logo />

      <RoomCode roomCode={roomCode} />

      {/* 우측 액션 버튼들 */}
      <div className="ml-auto flex items-center gap-1 shrink-0">
        <NewFileButton roomCode={roomCode} />

        <FileUploadButton roomCode={roomCode} />

        <FileDownloadButton />

        <FileCopyButton />

        <ShareButton />

        {/* 방 폭파 다이얼로그 - 권한이 있는 경우에만 표시 */}
        {canDestroyRoom && (
          <DestroyRoomDialog>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs h-8 px-2 sm:px-3 text-destructive hover:text-destructive"
            >
              <Bomb className="h-4 w-4" />
              <span className="hidden lg:inline">Destroy</span>
            </Button>
          </DestroyRoomDialog>
        )}

        <SettingsButton />

        <ThemeToggleButton />

        <LeaveRoomButton />
      </div>
    </header>
  );
}
