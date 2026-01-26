import { memo, useState } from 'react';
import { usePt } from '@/stores/pts';
import { ParticipantAvatar } from '../ui';
import { ParticipantInfo } from './ParticipantInfo';
import type { ParticipantProps, PermissionPtProps } from '../lib/types';
import { useRoomStore } from '@/stores/room';
import { useSocketStore } from '@/stores/socket';
import { SOCKET_EVENTS, ROLE, PRESENCE } from '@codejam/common';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { ThreeDot } from '@/shared/ui/three-dot';

/**
 * 참가자 정보를 표시하는 컴포넌트
 * - 아바타, 닉네임, 역할(role) 정보 표시
 * - 호스트 권한이 있는 경우 역할 변경 가능 (Editor ↔ Viewer)
 * - 온라인/오프라인 상태에 따라 불투명도 조절
 */
export const Participant = memo(
  ({ ptId, hasPermission = false }: ParticipantProps & PermissionPtProps) => {
    const pt = usePt(ptId);
    const { myPtId, roomCode } = useRoomStore();
    const { socket } = useSocketStore();
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [isEditable, setIsEditable] = useState(false);

    if (!pt) return null;

    const isOnline = pt.presence === PRESENCE.ONLINE;
    const opacity = isOnline ? 'opacity-100' : 'opacity-40';
    const isMe = ptId === myPtId;

    const isTargetHost = pt.role === ROLE.HOST;
    const canToggle = hasPermission && !isMe && !isTargetHost;

    const handleToggleRole = () => {
      if (!socket || !socket.connected) {
        return;
      }

      const newRole = pt.role === ROLE.EDITOR ? ROLE.VIEWER : ROLE.EDITOR;

      socket.emit(SOCKET_EVENTS.UPDATE_ROLE_PT, {
        roomCode,
        ptId: pt.ptId,
        role: newRole,
      });
    };

    const handleRenamePopover = () => {
      setIsEditable(true);
      setPopoverOpen(false);
    };

    return (
      <div
        className="flex items-center justify-between p-2 transition-colors
        select-none group hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <div className={`flex items-center space-x-5 ${opacity}`}>
          <ParticipantAvatar ptId={ptId} />
          <ParticipantInfo
            editable={isEditable}
            onEditable={setIsEditable}
            ptId={ptId}
            canToggle={canToggle}
            onToggleRole={handleToggleRole}
          />
        </div>
        {isMe && (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger>
              <ThreeDot />
            </PopoverTrigger>
            <PopoverContent className="z-9999">
              <div
                onClick={handleRenamePopover}
                className="absolute border w-45 p-4 rounded-md bg-white text-black dark:bg-black dark:hover:bg-gray-800 dark:text-white hover:bg-gray-50 hover:cursor-pointer"
              >
                <span>이름 변경</span>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    );
  },
);

Participant.displayName = 'Participant';
