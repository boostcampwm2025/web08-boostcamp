import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { socket } from "@/shared/api/socket";
import { emitJoinRoom } from "@/stores/socket-events";
import { useRoomStore } from "@/stores/room";
import { getRoomPtId } from "@/shared/lib/storage";

export function useRoomJoin() {
  const { roomCode: paramCode } = useParams<{ roomCode: string }>();
  const [isNicknameDialogOpen, setIsNicknameDialogOpen] = useState(false);
  const [roomError, setRoomError] = useState<string>("");

  const setRoomCode = useRoomStore((state) => state.setRoomCode);
  const roomCode = useRoomStore((state) => state.roomCode);

  // paramCode를 roomStore에 설정
  useEffect(() => {
    if (paramCode) {
      setRoomCode(paramCode);
    }
  }, [paramCode, roomCode, setRoomCode]);

  // Socket 에러 핸들링
  useEffect(() => {
    const handleError = (error: { type?: string; message?: string }) => {
      if (
        error.type === "NICKNAME_REQUIRED" ||
        error.message === "NICKNAME_REQUIRED"
      ) {
        setIsNicknameDialogOpen(true);
      } else if (
        error.type === "ROOM_NOT_FOUND" ||
        error.message === "ROOM_NOT_FOUND"
      ) {
        setRoomError("방을 찾을 수 없습니다.");
      } else {
        setRoomError(error.message || "오류가 발생했습니다.");
      }
    };

    socket.on("error", handleError);

    return () => {
      socket.off("error", handleError);
    };
  }, []);

  // 신규 사용자 판단 및 닉네임 모달 표시
  useEffect(() => {
    if (!paramCode) return;

    const savedPtId = getRoomPtId(paramCode);
    // localStorage에 ptId가 없으면 신규 유저 → 모달 표시
    if (!savedPtId) {
      setIsNicknameDialogOpen(true);
    }
    // 재접속 유저는 socket.connect()에서 자동으로 emitJoinRoom 호출됨
  }, [paramCode]);

  const handleNicknameConfirm = useCallback(
    (nickname: string) => {
      if (!paramCode) return;

      setRoomError("");
      console.log(paramCode);
      emitJoinRoom(paramCode, nickname);
      setIsNicknameDialogOpen(false);
    },
    [paramCode]
  );

  return {
    paramCode: paramCode || undefined,
    roomCode,
    isNicknameDialogOpen,
    setIsNicknameDialogOpen,
    roomError,
    handleNicknameConfirm,
  };
}
