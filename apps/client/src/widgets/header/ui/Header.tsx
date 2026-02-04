import { RoomCode } from './RoomCode';
import { Title } from './components/Title';
import { ShareButton } from './components/ShareButton';
import { DestroyRoomButton } from './components/DestroyRoomButton';
import { ThemeToggleButton } from './components/ThemeToggleButton';
import { RoleBadge } from './components/RoleBadge';
import { usePermission } from '@/shared/lib/hooks/usePermission';

type HeaderProps = {
  roomCode: string;
};

export default function Header({ roomCode }: HeaderProps) {
  const { role } = usePermission();

  return (
    <header className="flex items-center justify-between gap-1 px-2 py-1">
      <Title />
      <div className="flex items-center gap-1">
        <RoleBadge role={role} />
        <RoomCode roomCode={roomCode} />
        {/* <CodeExecutionButton /> */}
        <ShareButton roomCode={roomCode} />
        <DestroyRoomButton />
        <ThemeToggleButton />
      </div>
    </header>
  );
}
