import { RoomCode } from './RoomCode';
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
      {/* TODO: input으로 수정가능하게. ydoc 메타데이터에 저장. 문서편집권한과 동일 */}
      <h1 className="text-xl font-bold">방제목 아무이야기 ~~~</h1>
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
