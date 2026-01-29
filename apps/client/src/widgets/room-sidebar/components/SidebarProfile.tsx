import {
  RadixPopover as Popover,
  RadixPopoverTrigger as PopoverTrigger,
  RadixPopoverContent as PopoverContent,
} from '@codejam/ui';
import { usePt } from '@/stores/pts';
import { useRoomStore } from '@/stores/room';
import { createAvatarGenerator, AvvvatarsProvider } from '@codejam/ui';
import { ProfileCardContent } from './ProfileCardContent';

const provider = new AvvvatarsProvider({ variant: 'shape' });
const { Avatar } = createAvatarGenerator(provider);

export function SidebarProfile() {
  const { myPtId } = useRoomStore();
  const me = usePt(myPtId);

  if (!myPtId || !me) {
    return <div className="bg-muted/50 h-10 w-10 animate-pulse rounded-full" />;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-transform outline-none active:scale-95"
          title="설정 및 프로필"
        >
          <div className="relative">
            <Avatar id={me.ptHash} size={40} />
            <span className="ring-background absolute right-0 bottom-0 block h-3 w-3 rounded-full bg-green-500 ring-2 transition-colors" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="end"
        sideOffset={17}
        className="border-none bg-transparent p-0 shadow-none"
      >
        <ProfileCardContent me={me} />
      </PopoverContent>
    </Popover>
  );
}
