import { useState } from 'react';
import { toast } from '@codejam/ui';

export function useShare(roomCode: string, inviteUrl: string) {
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CodeJam 초대',
          text: `CodeJam 세션에 참여하세요! 방 코드: ${roomCode}`,
          url: inviteUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') console.error(error);
      }
    } else {
      handleCopyLink();
      toast('공유 기능을 지원하지 않는 브라우저입니다. 링크가 복사되었습니다.');
    }
  };

  return {
    codeCopied,
    linkCopied,
    handleCopyCode,
    handleCopyLink,
    handleWebShare,
  };
}
