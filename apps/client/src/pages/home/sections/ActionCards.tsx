import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Hash, Settings2 } from 'lucide-react';
import { ActionCard } from '../cards/ActionCard';
import { RoomCodeInput, ROOM_CODE_LENGTH } from '../components/RoomCodeInput';
import { Button } from '@/shared/ui/button';
import {
  createQuickRoom,
  checkRoomExists,
  createCustomRoom,
  type CustomRoomData,
} from '@/shared/api/room';
import { getRoomUrl } from '@/shared/lib/routes';
import { setRoomToken } from '@/shared/lib/storage';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { CustomStartPopover } from '../components/CustomStartPopover';

interface ErrorMessageProps {
  message: string;
}

function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="min-h-5 -mt-2 w-full">
      {message && (
        <p className="font-mono text-sm text-red-500 text-center wrap-break-words">
          {message}
        </p>
      )}
    </div>
  );
}

export function ActionCards() {
  const navigate = useNavigate();

  // Quick Start & Custom Start 공통 상태
  const [quickStartError, setQuickStartError] = useState<string>('');
  const [isQuickStartLoading, setIsQuickStartLoading] =
    useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Join Room 상태
  const [roomCode, setRoomCode] = useState<string[]>(
    Array(ROOM_CODE_LENGTH).fill(''),
  );
  const [joinRoomError, setJoinRoomError] = useState<string>('');
  const [isJoinRoomLoading, setIsJoinRoomLoading] = useState<boolean>(false);

  const handleQuickStart = async () => {
    if (isQuickStartLoading) return;

    setIsQuickStartLoading(true);
    setQuickStartError('');

    try {
      const { roomCode, token } = await createQuickRoom();

      // Save PT ID first
      setRoomToken(roomCode, token);

      // Then join the room
      const url = getRoomUrl(roomCode);
      navigate(url);
    } catch (e) {
      const error = e as Error;
      setQuickStartError(error.message);
    } finally {
      setIsQuickStartLoading(false);
    }
  };

  const handleCustomStart = async (data: CustomRoomData) => {
    if (isQuickStartLoading) return; // 로딩 상태 공유

    setIsQuickStartLoading(true);
    setQuickStartError('');

    try {
      const { roomCode, token } = await createCustomRoom(data);
      setRoomToken(roomCode, token);
      navigate(getRoomUrl(roomCode));
    } catch (e) {
      setQuickStartError((e as Error).message);
    } finally {
      setIsQuickStartLoading(false);
      setIsPopoverOpen(false); // 성공 시 팝오버 닫기
    }
  };

  const handleJoinRoom = async () => {
    const code = roomCode.join('');
    if (code.length !== ROOM_CODE_LENGTH) return;
    if (isJoinRoomLoading) return;

    setIsJoinRoomLoading(true);
    setJoinRoomError('');

    try {
      const status = await checkRoomExists(code);
      if (status === 'FULL') {
        setJoinRoomError('Room member is max');
      } else {
        const roomUrl = getRoomUrl(code);
        navigate(roomUrl);
      }
    } catch (e) {
      const error = e as Error;
      setJoinRoomError(error.message);
    } finally {
      setIsJoinRoomLoading(false);
    }
  };

  return (
    <section className="mb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
        {/* === 방 만들기 카드 === */}
        <ActionCard
          icon={Users}
          title="방 만들기"
          description="새로운 협업 공간을 생성하고 팀원들을 초대하세요"
          colorKey="blue"
        >
          <div className="flex flex-col items-center gap-4 w-full">
            {/* Split Button 컨테이너 */}
            <div className="flex w-full shadow-sm rounded-md">
              {/* 왼쪽: Quick Start Button */}
              <Button
                onClick={handleQuickStart}
                disabled={isQuickStartLoading}
                className={`flex-1 rounded-r-none border-r ${
                  quickStartError
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-medium text-lg py-6 transition-all duration-200 font-mono cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400`}
              >
                {isQuickStartLoading ? 'Loading...' : 'Quick Start'}
              </Button>

              {/* 오른쪽: Custom Start Popover Trigger */}
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    disabled={isQuickStartLoading}
                    className={`w-14 rounded-l-none ${
                      quickStartError
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white py-6 flex items-center justify-center`}
                  >
                    <Settings2 className="w-5 h-5" />
                  </Button>
                </PopoverTrigger>

                {/* Popover Content */}
                <PopoverContent
                  className="bg-white p-4 shadow-xl border border-gray-200"
                  align="end"
                  sideOffset={8}
                >
                  <CustomStartPopover
                    onCreate={handleCustomStart}
                    isLoading={isQuickStartLoading}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <ErrorMessage message={quickStartError} />
          </div>
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
              hasError={!!joinRoomError}
              onSubmit={handleJoinRoom}
            />

            <ErrorMessage message={joinRoomError} />
            <Button
              onClick={handleJoinRoom}
              disabled={
                roomCode.some((digit) => digit === '') || isJoinRoomLoading
              }
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium text-lg py-6 transition-all duration-200 rounded-none font-mono cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
            >
              {isJoinRoomLoading ? '입장 중...' : '입장하기'}
            </Button>
          </div>
        </ActionCard>
      </div>
    </section>
  );
}
