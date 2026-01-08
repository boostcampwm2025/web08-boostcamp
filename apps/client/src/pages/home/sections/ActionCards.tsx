import { useState } from "react";
import { Users, Hash } from "lucide-react";
import { ActionCard } from "../cards/ActionCard";
import { RoomCodeInput, ROOM_CODE_LENGTH } from "../components/RoomCodeInput";
import { Button } from "@/shared/ui/button";

interface ErrorMessageProps {
  message: string;
}

function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="h-5 -mt-2">
      {message && <p className="text-sm text-red-500 text-center">{message}</p>}
    </div>
  );
}

export function ActionCards() {
  const [roomCode, setRoomCode] = useState<string[]>(
    Array(ROOM_CODE_LENGTH).fill("")
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleQuickStart = () => {
    console.log("Quick Start clicked");
    // Add your room creation logic here
  };

  const handleJoinRoom = () => {
    const code = roomCode.join("");
    if (code.length !== ROOM_CODE_LENGTH) return;

    // Add your room join logic here
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-10">
      <ActionCard
        icon={Users}
        title="방 만들기"
        description="새로운 협업 공간을 생성하고 팀원들을 초대하세요"
        colorKey="blue"
      >
        <Button
          onClick={handleQuickStart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg py-6 transition-all duration-200 rounded-none font-mono cursor-pointer"
        >
          Quick Start
        </Button>
      </ActionCard>

      <ActionCard
        icon={Hash}
        title="방 번호로 입장"
        description="기존 방 번호를 입력하여 협업에 참여하세요"
        colorKey="purple"
      >
        <div className="flex flex-col items-center gap-4 w-full">
          <RoomCodeInput
            value={roomCode}
            onChange={setRoomCode}
            hasError={!!errorMessage}
            onSubmit={handleJoinRoom}
          />
          <ErrorMessage message={errorMessage} />
          <Button
            onClick={handleJoinRoom}
            disabled={roomCode.some((digit) => digit === "")}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium text-lg py-6 transition-all duration-200 rounded-none font-mono cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
          >
            입장하기
          </Button>
        </div>
      </ActionCard>
    </div>
  );
}
