type SystemMessageProps = {
  message: string;
};

/**
 * 시스템 메시지 한 줄 표시
 * - 입장/퇴장 알림 등
 * - 중앙 정렬, 회색 텍스트
 */
export function SystemMessage({ message }: SystemMessageProps) {
  return (
    <div className="flex justify-center py-1">
      <span className="text-muted-foreground text-center text-xs">
        {message}
      </span>
    </div>
  );
}
