import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Hash, Settings2 } from 'lucide-react';
import { ActionCard } from '../cards/ActionCard';
import { RoomCodeInput, ROOM_CODE_LENGTH } from '../components/RoomCodeInput';
import { RadixButton as Button } from '@codejam/ui';
import {
  createQuickRoom,
  checkRoomJoinable,
  createCustomRoom,
} from '@/shared/api/room';
import type { CreateCustomRoomRequest } from '@codejam/common';
import { ROUTES } from '@codejam/common';
import { setRoomToken } from '@/shared/lib/storage';
import {
  RadixPopover as Popover,
  RadixPopoverContent as PopoverContent,
  RadixPopoverTrigger as PopoverTrigger,
} from '@codejam/ui';
import { CustomStartPopover } from '../components/CustomStartPopover';

interface ErrorMessageProps {
  message: string;
}

function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="-mt-2 min-h-5 w-full">
      {message && (
        <p className="wrap-break-words text-center font-mono text-sm text-red-500">
          {message}
        </p>
      )}
    </div>
  );
}

export function ActionCards() {
  const navigate = useNavigate();

  // Quick Start & Custom Start 공통 상태
  const [createRoomError, setCreateRoomError] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Join Room 상태
  const [roomCode, setRoomCode] = useState<string[]>(
    Array(ROOM_CODE_LENGTH).fill(''),
  );
  const [joinRoomError, setJoinRoomError] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);

  const handleQuickStart = async () => {
    if (isCreating) return;

    setIsCreating(true);
    setCreateRoomError('');

    try {
      const { roomCode } = await createQuickRoom();

      // Then join the room
      const url = ROUTES.ROOM(roomCode);
      navigate(url);
    } catch (e) {
      const error = e as Error;
      setCreateRoomError(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCustomStart = async (data: CreateCustomRoomRequest) => {
    if (isCreating) return;

    setIsCreating(true);
    setCreateRoomError('');

    try {
      const { roomCode, token } = await createCustomRoom(data);
      setRoomToken(roomCode, token);
      navigate(ROUTES.ROOM(roomCode));
    } catch (e) {
      setCreateRoomError((e as Error).message);
    } finally {
      setIsCreating(false);
      setIsPopoverOpen(false); // 성공 시 팝오버 닫기
    }
  };

  const handleJoinRoom = async () => {
    const code = roomCode.join('');
    if (code.length !== ROOM_CODE_LENGTH) return;
    if (isJoining) return;

    setIsJoining(true);
    setJoinRoomError('');

    try {
      const status = await checkRoomJoinable(code);
      if (status === 'FULL') {
        setJoinRoomError('방의 정원이 초과되었습니다.');
      } else {
        const roomUrl = ROUTES.ROOM(code);
        navigate(roomUrl);
      }
    } catch (e) {
      const error = e as Error;
      setJoinRoomError(error.message);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <section className="w-full px-4">
      <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
        {/* === 방 만들기 카드 === */}
        <ActionCard
          icon={Users}
          title="방 만들기"
          description="새로운 협업 공간을 생성하고 팀원들을 초대하세요"
          colorKey="blue"
        >
          <div className="flex w-full flex-col items-center gap-4">
            {/* Quick Start 버튼 */}
            <Button
              onClick={handleQuickStart}
              disabled={isCreating}
              className={`h-14 w-full text-lg shadow-md transition-all duration-200 ${createRoomError ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg'} flex items-center justify-center gap-2 rounded-xl font-mono text-white`}
            >
              {isCreating ? 'Creating...' : 'Quick Start'}
            </Button>

            {/* Custom Start Popover Trigger */}
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger
                disabled={isCreating}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md font-mono text-sm font-medium whitespace-nowrap text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:pointer-events-none disabled:opacity-50"
              >
                <Settings2 className="h-4 w-4" />
                Custom Start
              </PopoverTrigger>

              <PopoverContent
                className="w-80 overflow-hidden rounded-xl border-gray-100 bg-white p-0 shadow-2xl"
                align="center"
                sideOffset={12}
              >
                <CustomStartPopover
                  onCreate={handleCustomStart}
                  isLoading={isCreating}
                />
              </PopoverContent>
            </Popover>

            <ErrorMessage message={createRoomError} />
          </div>
        </ActionCard>

        {/* === 방 번호로 입장 카드 === */}
        <ActionCard
          icon={Hash}
          title="방 번호로 입장"
          description="공유받은 6자리 방 코드를 입력하여 참여하세요"
          colorKey="green"
        >
          <div className="flex w-full flex-col items-center gap-6">
            <RoomCodeInput
              value={roomCode}
              onChange={setRoomCode}
              hasError={!!joinRoomError}
              onSubmit={handleJoinRoom}
              colorKey="green"
            />

            <div className="w-full space-y-3">
              <Button
                onClick={handleJoinRoom}
                disabled={roomCode.some((digit) => digit === '') || isJoining}
                className={`group from-brand-green shadow-brand-green/20 hover:to-brand-green hover:shadow-brand-green/40 relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br to-emerald-600 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:bg-none disabled:text-gray-400 disabled:shadow-none`}
              >
                {isJoining ? '입장 중...' : '입장하기'}
              </Button>
              <ErrorMessage message={joinRoomError} />
            </div>
          </div>
        </ActionCard>
      </div>
    </section>
  );
}
