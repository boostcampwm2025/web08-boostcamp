interface ParticipantNameProps {
  nickname: string;
  ptHash?: string;
  isMe: boolean;
}

/**
 * 참가자의 닉네임과 해시태그를 표시하는 컴포넌트
 * - 본인인 경우 "YOU" 뱃지 표시
 */
export function ParticipantName({
  nickname,
  ptHash,
  isMe,
}: ParticipantNameProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
        {nickname}
      </span>
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
