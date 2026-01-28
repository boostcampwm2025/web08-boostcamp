interface ParticipantsHeaderProps {
  totalCount: number;
}

/**
 * 참가자 목록의 헤더 컴포넌트
 * - 접기/펼치기 토글 기능
 * - 전체 참가자 수 표시
 */
export function ParticipantsHeader({ totalCount }: ParticipantsHeaderProps) {
  return (
    <div className="-mx-4 flex cursor-pointer items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
        <h2 className="text-sm font-bold tracking-wide uppercase">
          Participants
        </h2>
        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
          {totalCount}
        </span>
      </div>
    </div>
  );
}
