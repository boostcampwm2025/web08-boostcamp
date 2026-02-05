import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { usePt, usePtsStore } from '@/stores/pts';
import { useRoomStore } from '@/stores/room';
import { useSocketStore } from '@/stores/socket';
import {
  SOCKET_EVENTS,
  ROLE,
  PERMISSION,
  ROOM_TYPE,
  nicknameSchema,
  type Pt as Participant,
  type PtId,
} from '@codejam/common';
import { usePermission } from '@/shared/lib/hooks/usePermission';
import { getRoleDisplayText } from '../types';

export interface UseParticipantReturn {
  pt: Participant | null;
  isMe: boolean;
  canManageRole: boolean;
  showHostClaimSwitcher: boolean;
  nickname: {
    isEditing: boolean;
    value: string;
    error: string | null;
    handleClick: () => void;
    handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    handleSubmit: () => void;
  };
  hostPassword: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (password: string) => void;
  };
  role: {
    toggle: () => void;
    isEditor: boolean;
    displayText: string;
  };
}

export const useParticipant = (ptId: PtId): UseParticipantReturn => {
  const pt = usePt(ptId) || null;
  const { myPtId, roomCode, roomType, hasHostPassword } = useRoomStore();
  const { socket } = useSocketStore();
  const { can } = usePermission();
  const setPt = usePtsStore((state) => state.setPt);

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const isMe = ptId === myPtId;
  const roleText = pt ? getRoleDisplayText(pt.role) : '';
  const isEditor = pt ? pt.role === ROLE.EDITOR : false;

  const canManageRole = can(PERMISSION.MANAGE_ROLE);
  const showHostClaimSwitcher =
    isMe &&
    roomType === ROOM_TYPE.CUSTOM &&
    pt?.role !== ROLE.HOST &&
    hasHostPassword;

  const toggleRole = () => {
    if (!socket?.connected || !canManageRole || isMe || !pt) return;
    const nextRole = pt.role === ROLE.EDITOR ? ROLE.VIEWER : ROLE.EDITOR;
    socket.emit(SOCKET_EVENTS.UPDATE_ROLE_PT, {
      roomCode,
      ptId: pt.ptId,
      role: nextRole,
    });
  };

  const handleNicknameClick = () => {
    if (!isMe || !pt) return;
    setIsEditing(true);
    setInputValue(pt.nickname);
    setError(null);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const result = nicknameSchema.safeParse(value);
    if (!result.success) {
      setError(result.error.issues[0]?.message || null);
    } else {
      setError(null);
    }
  };

  const submitNickname = () => {
    if (!pt) return;
    const validationResult = nicknameSchema.safeParse(inputValue);

    if (!validationResult.success) {
      setInputValue(pt.nickname);
      setError(null);
      setIsEditing(false);
      return;
    }

    if (inputValue === pt.nickname) {
      setIsEditing(false);
      setError(null);
      return;
    }

    const validNickname = validationResult.data;
    setPt(ptId, { ...pt, nickname: validNickname });
    socket?.emit(SOCKET_EVENTS.UPDATE_NICKNAME_PT, {
      ptId,
      nickname: validNickname,
    });

    setIsEditing(false);
    setError(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code === 'Enter') {
      submitNickname();
    } else if (e.code === 'Escape') {
      setIsEditing(false);
      setError(null);
    }
  };

  const handlePasswordConfirm = (password: string) => {
    socket?.emit(SOCKET_EVENTS.CLAIM_HOST, { hostPassword: password });
  };

  return {
    pt,
    isMe,
    canManageRole,
    showHostClaimSwitcher: !!showHostClaimSwitcher,
    nickname: {
      isEditing,
      value: inputValue,
      error,
      handleClick: handleNicknameClick,
      handleChange: handleInputChange,
      handleKeyDown,
      handleSubmit: submitNickname,
    },
    hostPassword: {
      isOpen: isPasswordDialogOpen,
      onOpenChange: setIsPasswordDialogOpen,
      onConfirm: handlePasswordConfirm,
    },
    role: {
      toggle: toggleRole,
      isEditor,
      displayText: roleText,
    },
  };
};
