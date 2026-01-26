import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { ROLE_BADGE_STYLES, getRoleDisplayText } from '../lib/types';
import { socket } from '@/shared/api/socket';
import { SOCKET_EVENTS, ROLE } from '@codejam/common';
import { HostPasswordDialog } from '@/widgets/dialog/HostPasswordDialog';
import type { Pt } from '@codejam/common';

interface HostClaimSwitcherProps {
  role: Pt['role'];
  hasHostPassword: boolean | null;
}

/**
 * 호스트 권한 요청 스위처 컴포넌트
 * - Custom Room + 비호스트 + 본인일 때 표시
 * - 호버 시 `현재role | HOST` 형태로 전환 UI 표시
 * - 클릭 시 비밀번호 입력 다이얼로그
 */
export function HostClaimSwitcher({
  role,
  hasHostPassword,
}: HostClaimSwitcherProps) {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const roleText = getRoleDisplayText(role);
  const isDisabled = !hasHostPassword;

  const handleHostClick = () => {
    if (isDisabled) return;
    setIsPasswordDialogOpen(true);
  };

  const handlePasswordConfirm = (password: string) => {
    socket.emit(SOCKET_EVENTS.CLAIM_HOST, { hostPassword: password });
  };

  return (
    <>
      {/* [State A] Static Badge */}
      <div className="block group-hover:hidden">
        <span
          className={cn(
            'rounded-md border px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase',
            ROLE_BADGE_STYLES[role],
            'opacity-90',
          )}
        >
          {roleText}
        </span>
      </div>

      {/* [State B] Interactive Switch - role | HOST */}
      <div
        className={cn(
          'animate-in fade-in zoom-in-95 relative hidden h-6 w-[104px] items-center rounded-md bg-gray-200 p-0.5 duration-200 select-none group-hover:flex dark:bg-gray-700',
          isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        )}
        onClick={(e) => {
          e.stopPropagation();
          handleHostClick();
        }}
        title={isDisabled ? '호스트 비밀번호가 설정되지 않은 방입니다' : ''}
      >
        {/* Current Role Pill (선택됨) */}
        <div className="absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-sm bg-white shadow-sm dark:bg-gray-600" />

        {/* Current Role Label */}
        <div
          className={cn(
            'z-10 flex-1 text-center text-[10px] font-bold tracking-wider uppercase transition-colors',
            role === ROLE.EDITOR
              ? 'text-blue-600 dark:text-blue-300'
              : 'text-gray-800 dark:text-gray-100',
          )}
        >
          {roleText}
        </div>

        {/* HOST Label */}
        <div className="z-10 flex-1 text-center text-[10px] font-bold tracking-wider text-gray-400 uppercase transition-colors dark:text-gray-500">
          Host
        </div>
      </div>

      {/* 비밀번호 입력 다이얼로그 */}
      <HostPasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        onConfirm={handlePasswordConfirm}
      />
    </>
  );
}
