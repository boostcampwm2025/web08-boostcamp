import { memo } from 'react';
import { usePt } from '@/stores/pts';
import { ParticipantAvatar } from './ui';
import { ParticipantInfo } from './ParticipantInfo';
import type { ParticipantProps, PermissionPtProps } from './types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { useRoomStore } from '@/stores/room';
import { MenuButton } from '@/shared/ui';
import { useSocketStore } from '@/stores/socket';
import { SOCKET_EVENTS } from '@codejam/common';

export const Participant = memo(
  ({ ptId, hasPermission = false }: ParticipantProps & PermissionPtProps) => {
    const pt = usePt(ptId);
    const { myPtId, roomCode } = useRoomStore();
    const { socket } = useSocketStore();
    if (!pt) return null;

    const isOnline = pt.presence === 'online';
    const opacity = isOnline ? 'opacity-100' : 'opacity-40';

    const handleClick = () => {
      if (!socket || !socket.connected) {
        return;
      }

      socket.emit(SOCKET_EVENTS.UPDATE_PT, {
        roomCode,
        ptId: pt.ptId,
        role: pt.role === 'editor' ? 'viewer' : 'editor',
      });
    };

    return (
      <div
        className="flex items-center justify-between p-2 transition-colors
        select-none hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <div className={`flex items-center space-x-3 ${opacity}`}>
          <ParticipantAvatar ptId={ptId} />
          <ParticipantInfo ptId={ptId} />
        </div>
        {hasPermission && pt.ptId !== myPtId && (
          <Popover>
            <PopoverTrigger>
              <div className="outline-none bg-transparent border-none">
                <svg
                  width="16px"
                  height="16px"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                </svg>
              </div>
            </PopoverTrigger>
            <PopoverContent className="z-50">
              <div className="flex p-4 bg-background rounded-md border">
                <MenuButton
                  label={
                    pt.role === 'editor' ? 'Convert Viewer' : 'Convert Editor'
                  }
                  onClick={handleClick}
                />
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    );
  },
);

Participant.displayName = 'Participant';
