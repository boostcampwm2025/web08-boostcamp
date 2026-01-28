import { useState, useMemo } from 'react';
import { Participant } from './components';
import { ParticipantsFilterBar } from './components/ParticipantsFilterBar';
import { usePt, usePtsStore } from '@/stores/pts';
import { useRoomStore } from '@/stores/room';
import { useSocketStore } from '@/stores/socket';
import { SOCKET_EVENTS, ROLE } from '@codejam/common';
import { SidebarHeader, toast } from '@codejam/ui';
import type { SortKey } from './lib/types';
import type { FilterOption } from './types';
import { filterParticipants, sortParticipants } from './types';

/**
 * 참가자 목록 위젯 메인 컴포넌트
 * - 실시간 참가자 목록 표시
 * - 검색, 정렬, 필터링 기능 제공
 * - 호스트의 경우 참가자 역할 관리 가능
 */
export function Participants() {
  const pts = usePtsStore((state) => state.pts);
  const myPtId = useRoomStore((state) => state.myPtId);
  const roomCode = useRoomStore((state) => state.roomCode);
  const socket = useSocketStore((state) => state.socket);

  // 내 정보와 권한 확인
  const meData = usePt(myPtId);
  const iAmHost = meData?.role === ROLE.HOST;

  // 상태 관리
  const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('time');

  // 필터링 및 정렬된 참가자 목록
  const { me, others, totalCount } = useMemo(() => {
    // 1. 필터 적용
    const filtered = filterParticipants(pts, selectedFilters);

    // 2. 정렬 적용
    const sorted = sortParticipants(filtered, sortKey);

    // 3. me와 others 분리
    const me = myPtId ? sorted.find((pt) => pt.ptId === myPtId) : undefined;
    const others = sorted.filter((pt) => pt.ptId !== myPtId);

    return { me, others, totalCount: sorted.length };
  }, [pts, selectedFilters, sortKey, myPtId]);

  // 정렬 핸들러
  const handleSortChange = (key: SortKey) => {
    setSortKey(key);
  };

  // 일괄 권한 변경 핸들러
  const handleBulkEdit = () => {
    if (!socket || !roomCode || !iAmHost) return;

    const targetPtIds = others.map((pt) => pt.ptId);
    if (targetPtIds.length === 0) {
      toast.info('편집 권한을 부여할 참가자가 없습니다.');
      return;
    }

    // 각 참가자에게 Editor 권한 부여
    targetPtIds.forEach((ptId) => {
      socket.emit(SOCKET_EVENTS.UPDATE_ROLE_PT, {
        roomCode,
        ptId,
        role: ROLE.EDITOR,
      });
    });

    toast.success(`${targetPtIds.length}명에게 편집 권한을 부여했습니다.`);
  };

  const handleBulkView = () => {
    if (!socket || !roomCode || !iAmHost) return;

    const targetPtIds = others.map((pt) => pt.ptId);
    if (targetPtIds.length === 0) {
      toast.info('읽기 권한으로 변경할 참가자가 없습니다.');
      return;
    }

    // 각 참가자에게 Viewer 권한 부여
    targetPtIds.forEach((ptId) => {
      socket.emit(SOCKET_EVENTS.UPDATE_ROLE_PT, {
        roomCode,
        ptId,
        role: ROLE.VIEWER,
      });
    });

    toast.success(`${targetPtIds.length}명을 읽기 권한으로 변경했습니다.`);
  };

  return (
    <div className="w-full px-4">
      <SidebarHeader title="참가자" count={totalCount} />

      <div className={`flex flex-col overflow-hidden`}>
        {/* 필터 바 */}
        <div className="p-1">
          <ParticipantsFilterBar
            selectedFilters={selectedFilters}
            onFiltersChange={setSelectedFilters}
            sortKey={sortKey}
            onSortChange={handleSortChange}
            filteredCount={others.length}
            onBulkEdit={handleBulkEdit}
            onBulkView={handleBulkView}
            isHost={iAmHost}
          />
        </div>

        <div className="max-h-[30vh] min-h-0 flex-1 overflow-y-auto">
          {me && <Participant ptId={me.ptId} hasPermission={false} />}

          {me && others.length > 0 && (
            <div className="mx-3 my-1 border-t border-gray-300 opacity-50 dark:border-gray-600" />
          )}

          {others.map((p) => (
            <Participant key={p.ptId} ptId={p.ptId} hasPermission={iAmHost} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Re-export components only (for Fast Refresh compatibility)
export { Participant } from './components/Participant';
export { ParticipantInfo } from './components/ParticipantInfo';
export { ParticipantAvatar, ParticipantMenu } from './ui';
