import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '@/shared/api/socket';
import { useRoomStore } from '@/stores/room';
import { ERROR_CODE } from '@codejam/common';
import { joinRoom, verifyPassword } from '@/shared/api/room';

export function useRoomJoin() {
  const { roomCode: paramCode } = useParams<{ roomCode: string }>();

  // 에러 상태
  const [roomError, setRoomError] = useState<string>('');
  const [passwordError, setPasswordError] = useState('');

  // 모달 상태
  const [isNicknameDialogOpen, setIsNicknameDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  // 전역 상태
  const setRoomCode = useRoomStore((state) => state.setRoomCode);

  // 컴포넌트가 마운트 되어 있는 동안(모달 전환 중) 값을 유지함
  const passwordRef = useRef('');

  // 1. URL 파라미터를 스토어에 저장
  useEffect(() => {
    if (paramCode) setRoomCode(paramCode);
  }, [paramCode, setRoomCode]);

  // 2. 소켓 에러 감지
  useEffect(() => {
    const handleError = (error: { type?: string; message?: string }) => {
      // 권한 관련은 에디터가 처리하므로 패스
      if (error.type === ERROR_CODE.PERMISSION_DENIED) return;

      switch (error.type) {
        // Case A: 비밀번호가 있는 방 -> 비밀번호 모달 Open
        case ERROR_CODE.PASSWORD_REQUIRED:
          setIsNicknameDialogOpen(false);
          setIsPasswordDialogOpen(true);
          break;

        // Case B: 비밀번호 틀림 (혹시 소켓으로 시도했을 경우 대비)
        case ERROR_CODE.PASSWORD_UNCORRECT:
          setIsPasswordDialogOpen(true);
          setPasswordError('비밀번호가 일치하지 않습니다.');
          break;

        // Case C: 공개 방이거나 토큰 없음 -> 닉네임 모달 Open
        case ERROR_CODE.NICKNAME_REQUIRED:
        case ERROR_CODE.UNAUTHORIZED:
          setIsPasswordDialogOpen(false);
          setIsNicknameDialogOpen(true);
          break;

        // Case D: 방 없음
        case ERROR_CODE.ROOM_NOT_FOUND:
          setRoomError('방을 찾을 수 없습니다.');
          break;

        default:
          setRoomError(error.message || '오류가 발생했습니다.');
      }
    };

    socket.on('error', handleError);
    return () => {
      socket.off('error', handleError);
    };
  }, []);

  // 3. [Step 1] 비밀번호 입력 확인
  // HTTP로 확인만 함
  const handlePasswordConfirm = useCallback(
    async (password: string) => {
      if (!paramCode) return;
      setPasswordError('');

      try {
        // [HTTP] 비밀번호 검증 API 호출
        await verifyPassword(paramCode, password);

        // 검증 통과 시 ref에 임시 저장
        passwordRef.current = password;

        setIsPasswordDialogOpen(false);
        setIsNicknameDialogOpen(true);
      } catch (e) {
        const error = e as { code: keyof typeof ERROR_CODE; message: string };
        if (
          error.code === ERROR_CODE.PASSWORD_UNCORRECT ||
          error.message?.includes('Incorrect')
        ) {
          setPasswordError('비밀번호가 일치하지 않습니다.');
        } else {
          setRoomError(error.message || '오류가 발생했습니다.');
        }
      }
    },
    [paramCode],
  );

  // 4. [Step 2] 닉네임 입력 확인 (최종 입장)
  // HTTP로 유저 생성(쿠키 발급) 후 -> 소켓 재연결
  const handleNicknameConfirm = useCallback(
    async (nickname: string) => {
      if (!paramCode) return;
      setRoomError('');

      try {
        // 저장해둔 비밀번호 가져오기
        const password = passwordRef.current;

        // 1. [HTTP] 입장 API 호출 (여기서 브라우저에 쿠키가 저장됨!)
        await joinRoom(paramCode, nickname, password);

        // 2. [Socket] 재연결 시퀀스
        // useSocket의 onConnect가 이미 emitJoinRoom을 처리하므로 connect()만 호출
        if (socket.connected) {
          socket.disconnect();
        }
        socket.connect();

        passwordRef.current = '';

        // 모달 닫기
        setIsNicknameDialogOpen(false);
      } catch (e) {
        const error = e as Error;
        setRoomError(error.message);
      }
    },
    [paramCode],
  );

  return {
    paramCode: paramCode || undefined,
    roomCode: paramCode,

    // 모달 상태
    isNicknameDialogOpen,
    isPasswordDialogOpen,
    setIsNicknameDialogOpen,
    setIsPasswordDialogOpen,

    // 에러 상태
    passwordError,
    roomError,

    // 핸들러
    handleNicknameConfirm,
    handlePasswordConfirm,
  };
}
