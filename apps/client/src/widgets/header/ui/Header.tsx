import { Logo } from './Logo';
import { RoomCode } from './RoomCode';
import { NewFileButton } from './buttons/NewFileButton';
import { FileUploadButton } from './buttons/FileUploadButton';
import { FileDownloadButton } from './buttons/FileDownloadButton';
import { FileCopyButton } from './buttons/FileCopyButton';
import { ShareButton } from './buttons/ShareButton';
import { DestroyRoomButton } from './buttons/DestroyRoomButton';
import { SettingsButton } from './buttons/SettingsButton';
import { ThemeToggleButton } from './buttons/ThemeToggleButton';
import { LeaveRoomButton } from './buttons/LeaveRoomButton';

type HeaderProps = {
  roomCode: string;
};

export default function Header({ roomCode }: HeaderProps) {
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
        <DestroyRoomButton />
        <SettingsButton />
        <ThemeToggleButton />
        <LeaveRoomButton />
      </div>
    </header>
  );
}
