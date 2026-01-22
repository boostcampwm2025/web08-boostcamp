import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import type { EditableProps } from '../lib/types';
import { Input } from '@/shared/ui';
import { usePtsStore } from '@/stores/pts';
import { socket } from '@/shared/api/socket';
import { SOCKET_EVENTS } from '@codejam/common';

interface ParticipantNameProps {
  nickname: string;
  ptHash?: string;
  isMe: boolean;
  ptId: string;
}

/**
 * 참가자의 닉네임과 해시태그를 표시하는 컴포넌트
 * - 본인인 경우 "YOU" 뱃지 표시
 */
export function ParticipantName({
  nickname,
  ptHash,
  isMe,
  ptId,
  editable,
  onEditable,
}: ParticipantNameProps & EditableProps) {
  const [rename, setRename] = useState(nickname);
  const pts = usePtsStore((state) => state.pts);
  const setPt = usePtsStore((state) => state.setPt);
  const myPt = pts[ptId];

  const handleChange = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    setRename(target.value.trim());
  };
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Enter') {
      handleSubmit();
    }
  };
  const handleSubmit = () => {
    if (myPt) {
      const naming =
        rename.trim().length < 1 || rename.trim().length > 6
          ? nickname
          : rename;
      setPt(ptId, { ...myPt, nickname: naming.trim() });
      socket.emit(SOCKET_EVENTS.UPDATE_NICKNAME_PT, {
        ptId,
        nickname: naming.trim(),
      });
    }
    onEditable(false);
  };

  return (
    <div className="flex items-center gap-1.5">
      {isMe && editable ? (
        <Input
          type="text"
          minLength={1}
          maxLength={5}
          className="text-sm font-semibold w-24"
          value={rename}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleSubmit}
          autoFocus
        />
      ) : (
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {nickname}
        </span>
      )}
      {ptHash && (
        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
          #{ptHash}
        </span>
      )}
      {isMe && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300">
          YOU
        </span>
      )}
    </div>
  );
}
