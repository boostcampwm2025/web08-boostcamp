import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import {
  createAvatarGenerator,
  AvvvatarsProvider,
  RadixInput as Input,
} from '@codejam/ui';
import { Pencil } from 'lucide-react';
import { adjustColor } from '@/shared/lib/utils/color';

import { usePtsStore } from '@/stores/pts';
import { socket } from '@/shared/api/socket';
import { SOCKET_EVENTS } from '@codejam/common';
import type { Pt } from '@codejam/common';
import { ProfileBannerAnimation } from './ProfileBannerAnimation';

const provider = new AvvvatarsProvider({ variant: 'shape' });
const { Avatar } = createAvatarGenerator(provider);

interface ProfileCardContentProps {
  me: Pt;
}

export function ProfileCardContent({ me }: ProfileCardContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [rename, setRename] = useState(me.nickname || '');

  const setPt = usePtsStore((state) => state.setPt);

  const bannerBaseColor = adjustColor(me.color, -30);
  const bannerEndColor = adjustColor(me.color, -50);
  const bannerStyle = `linear-gradient(135deg, ${bannerBaseColor}, ${bannerEndColor})`;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRename(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setRename(me.nickname || '');
      setIsEditing(false);
    }
  };

  const handleSubmit = () => {
    const currentNickname = me.nickname || '';
    const trimmedRename = rename.trim();

    const naming =
      trimmedRename.length < 1 || trimmedRename.length > 6
        ? currentNickname
        : trimmedRename;

    if (naming !== currentNickname) {
      setPt(me.ptId, { ...me, nickname: naming });

      socket.emit(SOCKET_EVENTS.UPDATE_NICKNAME_PT, {
        ptId: me.ptId,
        nickname: naming,
      });

      setRename(naming);
    } else {
      setRename(currentNickname);
    }

    setIsEditing(false);
  };

  return (
    <div className="bg-card ring-border w-72 overflow-hidden rounded-xl shadow-xl ring-1">
      <div
        className="relative h-20 w-full overflow-hidden transition-colors"
        style={{ background: bannerStyle }}
      >
        <ProfileBannerAnimation />
      </div>

      <div className="px-4 pb-4">
        <div className="relative -mt-10 mb-3 flex items-end justify-between">
          <div className="bg-card relative rounded-full p-1.5">
            <Avatar
              id={me.ptHash}
              size={70}
              className="rounded-full shadow-md"
            />
            {/* 온라인 상태 표시 */}
            <span className="ring-card absolute right-2 bottom-2 block h-5 w-5 rounded-full bg-green-500 ring-4" />
          </div>

          <div className="mb-2">
            {me.ptHash && (
              <span className="border-border/50 bg-muted/50 text-muted-foreground rounded-md border px-2 py-1 font-mono text-[11px]">
                #{me.ptHash}
              </span>
            )}
          </div>
        </div>

        <div className="bg-muted/20 rounded-lg p-3">
          <h3 className="text-muted-foreground mb-1 text-xs font-bold tracking-wider uppercase">
            사용자 이름
          </h3>
          <div className="flex min-h-[32px] items-center gap-1.5">
            {isEditing ? (
              <Input
                type="text"
                minLength={1}
                maxLength={6}
                className="bg-background h-8 w-full text-lg font-semibold"
                value={rename}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleSubmit}
                autoFocus
              />
            ) : (
              <div className="group flex w-full items-center justify-between">
                <span
                  className="text-foreground cursor-pointer truncate text-lg font-semibold decoration-dashed underline-offset-4 hover:underline"
                  onClick={() => setIsEditing(true)}
                  title="클릭하여 이름 변경"
                >
                  {me.nickname}
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="hover:bg-muted text-muted-foreground hover:text-foreground rounded p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Pencil size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <p className="text-muted-foreground mt-2 text-right text-[10px]">
            Enter를 눌러 저장 (최대 6글자)
          </p>
        )}

        <div className="border-border/50 text-muted-foreground mt-3 flex items-center justify-between border-t pt-2 text-[10px]">
          <span>THEME COLOR</span>
          <div className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-[2px] ring-1 ring-black/10 ring-inset dark:ring-white/20"
              style={{ backgroundColor: me.color }}
            />
            <span className="font-mono uppercase">{me.color}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
