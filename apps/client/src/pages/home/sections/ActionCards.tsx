import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Hash, Settings } from 'lucide-react';
import { ActionCard } from '../cards/ActionCard';
import { RoomCodeInput, ROOM_CODE_LENGTH } from '../components/RoomCodeInput';
import { Button } from '@/shared/ui/button';
import {
  createQuickRoom,
  checkRoomExists,
  createCustomRoom,
} from '@/shared/api/room';
import { getRoomUrl } from '@/shared/lib/routes';
import { setRoomToken } from '@/shared/lib/storage';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Input } from '@/shared/ui';

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

  const [roomCode, setRoomCode] = useState<string[]>(
    Array(ROOM_CODE_LENGTH).fill(''),
  );
  const [quickStartError, setQuickStartError] = useState<string>('');
  const [joinRoomError, setJoinRoomError] = useState<string>('');
  const [isQuickStartLoading, setIsQuickStartLoading] =
    useState<boolean>(false);
  const [isJoinRoomLoading, setIsJoinRoomLoading] = useState<boolean>(false);

  const [customRoomData, setCustomRoomData] = useState({
    maxPts: 6,
    roomPassword: '',
    hostPassword: '',
  });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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

  const handleCustomStart = async () => {
    if (isQuickStartLoading) return; // 로딩 상태 공유 (또는 별도 분리 가능)

    setIsQuickStartLoading(true);
    setQuickStartError('');

    try {
      // 숫자 형변환 확인
      const payload = {
        ...customRoomData,
        maxPts: Number(customRoomData.maxPts),
      };

      const { roomCode, token } = await createCustomRoom(payload);

      setRoomToken(roomCode, token);
      const url = getRoomUrl(roomCode);
      navigate(url);
    } catch (e) {
      const error = e as Error;
      setQuickStartError(error.message);
    } finally {
      setIsQuickStartLoading(false);
      setIsPopoverOpen(false);
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
        <ActionCard
          icon={Users}
          title="방 만들기"
          description="새로운 협업 공간을 생성하고 팀원들을 초대하세요"
          colorKey="blue"
        >
          <div className="flex flex-col items-center gap-4 w-full">
            <Button
              onClick={handleQuickStart}
              disabled={isQuickStartLoading}
              className={`w-full ${
                quickStartError
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white font-medium text-lg py-6 transition-all duration-200 rounded-none font-mono cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400`}
            >
              {isQuickStartLoading ? 'Loading...' : 'Quick Start'}
            </Button>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 py-2"
                >
                  <Settings className="w-4 h-4 mr-2" /> Custom Start
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4 bg-white" align="center">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 leading-none">
                    방 옵션 설정
                  </h4>
                  <p className="text-sm text-gray-500">
                    원하는 설정을 입력하고 방을 생성하세요.
                  </p>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">
                        최대 인원 (Max Pts)
                      </label>
                      <Input
                        type="number"
                        placeholder="6"
                        value={customRoomData.maxPts}
                        onChange={(e) =>
                          setCustomRoomData({
                            ...customRoomData,
                            maxPts: Number(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">
                        방 비밀번호 (Optional)
                      </label>
                      <Input
                        type="password"
                        placeholder="입장 시 필요한 비밀번호"
                        value={customRoomData.roomPassword}
                        onChange={(e) =>
                          setCustomRoomData({
                            ...customRoomData,
                            roomPassword: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">
                        호스트 비밀번호 (Optional)
                      </label>
                      <Input
                        type="password"
                        placeholder="방장 전용 비밀번호"
                        value={customRoomData.hostPassword}
                        onChange={(e) =>
                          setCustomRoomData({
                            ...customRoomData,
                            hostPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCustomStart}
                    disabled={isQuickStartLoading}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white mt-2"
                  >
                    {isQuickStartLoading ? '생성 중...' : '만들기'}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

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
