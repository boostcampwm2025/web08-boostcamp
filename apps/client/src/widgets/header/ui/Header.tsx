import { Logo } from './Logo';
import { RoomCode } from './RoomCode';
import { NewFileButton } from './buttons/NewFileButton';
import { FileUploadButton } from './buttons/FileUploadButton';
import { FileDownloadButton } from './buttons/FileDownloadButton';
import { FileCopyButton } from './buttons/FileCopyButton';
import { CodeExecutionButton } from './buttons/CodeExecutionButton';
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
    <header className="bg-background border-border scrollbar-hide flex h-14 items-center gap-2 overflow-x-auto border-b px-4 sm:gap-4">
      <Logo />

      <RoomCode roomCode={roomCode} />

      {/* 우측 액션 버튼들 */}
      <div className="ml-auto flex shrink-0 items-center gap-1">
        <NewFileButton roomCode={roomCode} />
        <FileUploadButton roomCode={roomCode} />
        <FileDownloadButton />
        <FileCopyButton />
        <CodeExecutionButton />
        <ShareButton roomCode={roomCode} />
        <DestroyRoomButton />
        <SettingsButton />
        <ThemeToggleButton />
        <LeaveRoomButton />
      </div>
    </header>
  );
}
