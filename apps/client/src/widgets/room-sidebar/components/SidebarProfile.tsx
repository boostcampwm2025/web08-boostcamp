import { usePt } from '@/stores/pts';
import { useRoomStore } from '@/stores/room';
import { createAvatarGenerator, LucideAvatarProvider } from '@codejam/ui';

const provider = new LucideAvatarProvider();
const { Avatar } = createAvatarGenerator(provider);

export function SidebarProfile() {
  const { myPtId } = useRoomStore();
  const me = usePt(myPtId);

  if (!myPtId || !me) {
    return <div className="bg-muted/50 h-10 w-10 animate-pulse rounded-full" />;
  }

  return (
    <button
      onClick={() => alert('설정 모달 오픈')}
      className="group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-transform outline-none active:scale-95"
      title="설정 및 프로필"
    >
      <div className="relative">
        <Avatar
          id={me.ptHash}
          color={me.color}
          size={40}
          className="overflow-hidden rounded-full shadow-sm transition-shadow group-hover:shadow-md"
        />

        <span className="ring-background absolute right-0 bottom-0 block h-3 w-3 rounded-full bg-green-500 ring-2 transition-colors" />
      </div>
    </button>
  );
}
