import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ERROR_CODE } from '@codejam/common';
import { getAuthStatus, joinRoom, verifyPassword } from '@/shared/api/room';
import { emitJoinRoom } from '@/stores/socket-events';
import { socket } from '@/shared/api/socket';
import { useRoomStore } from '@/stores/room';

export function useRoomJoin() {
  const { roomCode: paramCode } = useParams<{ roomCode: string }>();

  // 에러 상태
  const [roomError, setRoomError] = useState<string>('');
  const [passwordError, setPasswordError] = useState('');

  // 모달 상태
  const [isNicknameDialogOpen, setIsNicknameDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  // 컴포넌트가 마운트 되어 있는 동안(모달 전환 중) 값을 유지함
  const passwordRef = useRef('');

  const setRoomCode = useRoomStore((state) => state.setRoomCode);

  useEffect(() => {
    if (paramCode) setRoomCode(paramCode);
  }, [paramCode, setRoomCode]);

  const handleJoinWithToken = useCallback((roomCode: string, token: string) => {
    const sendJoinEvent = () => {
      emitJoinRoom(roomCode, token);
    };

    if (socket.connected) {
      // 1. 이미 소켓이 연결되어 있다면 즉시 입장
      sendJoinEvent();
    } else {
      // 2. 아직 연결 중이라면 연결되는 순간 딱 한 번 실행되도록 예약
      socket.once('connect', sendJoinEvent);
    }
  }, []);

  /**
   * [Step 1] 초기 로드 시 인증 상태 확인
   */
  useEffect(() => {
    const initAuth = async () => {
      if (!paramCode) return;
      try {
        const { token } = await getAuthStatus(paramCode);
        handleJoinWithToken(paramCode, token);
      } catch (e: unknown) {
        // 인증 실패: 에러 코드에 따라 모달 오픈
        const code = (e as { code?: string }).code;
        const message = (e as { message?: string }).message;
        if (code === ERROR_CODE.PASSWORD_REQUIRED) {
          setIsPasswordDialogOpen(true);
        } else if (code === ERROR_CODE.NICKNAME_REQUIRED) {
          setIsNicknameDialogOpen(true);
        } else {
          setRoomError(message || '방을 찾을 수 없습니다.');
        }
      }
    };
    initAuth();
  }, [paramCode, handleJoinWithToken]);

  /**
   * [Step 2] 비밀번호 확인 후 닉네임 모달로 전환
   */
  const handlePasswordConfirm = useCallback(
    async (password: string) => {
      if (!paramCode) return;
      try {
        await verifyPassword(paramCode, password);
        passwordRef.current = password;
        setIsPasswordDialogOpen(false);
        setIsNicknameDialogOpen(true);
      } catch (e: unknown) {
        const message = (e as { message?: string }).message;
        setPasswordError(message || '비밀번호가 틀렸습니다.');
      }
    },
    [paramCode],
  );

  /**
   * [Step 3] 닉네임 확인(입장) 후 토큰 전달
   */
  const handleNicknameConfirm = useCallback(
    async (nickname: string) => {
      if (!paramCode) return;
      try {
        const { token } = await joinRoom(
          paramCode,
          nickname,
          passwordRef.current,
        );

        handleJoinWithToken(paramCode, token);

        setIsNicknameDialogOpen(false);
        passwordRef.current = '';
      } catch (e: unknown) {
        const message = (e as { message?: string }).message;
        setRoomError(message || '입장 중 오류가 발생했습니다.');
      }
    },
    [paramCode, handleJoinWithToken],
  );

  return {
    paramCode,
    isNicknameDialogOpen,
    isPasswordDialogOpen,
    setIsNicknameDialogOpen,
    setIsPasswordDialogOpen,
    passwordError,
    roomError,
    handleNicknameConfirm,
    handlePasswordConfirm,
  };
}
