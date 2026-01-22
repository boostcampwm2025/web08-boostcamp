import { useEffect, useState, type ChangeEvent } from 'react';
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
import { Input } from '@/shared/ui';
import { Label } from '@radix-ui/react-label';
import { Checkbox } from '@/shared/ui/checkbox';
import { useTempValue } from '@/stores/temp';

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
  const [createRoomError, setCreateRoomError] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Join Room 상태
  const [roomCode, setRoomCode] = useState<string[]>(
    Array(ROOM_CODE_LENGTH).fill(''),
  );
  const [joinRoomError, setJoinRoomError] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [isPassword, setIsPassword] = useState(false);
  const [password, setPassword] = useState('');
  const { setTempRoomPassword } = useTempValue();

  useEffect(() => {
    setPassword('');
  }, [isPassword]);

  const handlePasswordChange = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    setPassword(target.value.trim());
  };

  const handleQuickStart = async () => {
    if (isCreating) return;

    setIsCreating(true);
    setCreateRoomError('');

    try {
      const { roomCode } = await createQuickRoom(password);
      setTempRoomPassword(password);

      // Then join the room
      const url = getRoomUrl(roomCode);
      navigate(url);
    } catch (e) {
      const error = e as Error;
      setCreateRoomError(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCustomStart = async (data: CustomRoomData) => {
    if (isCreating) return;

    setIsCreating(true);
    setCreateRoomError('');

    try {
      const { roomCode, token } = await createCustomRoom(data);
      setRoomToken(roomCode, token);
      navigate(getRoomUrl(roomCode));
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
      const status = await checkRoomExists(code);
      if (status === 'FULL') {
        setJoinRoomError('방의 정원이 초과되었습니다.');
      } else {
        const roomUrl = getRoomUrl(code);
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 w-full">
        {/* === 방 만들기 카드 === */}
        <ActionCard
          icon={Users}
          title="방 만들기"
          description="새로운 협업 공간을 생성하고 팀원들을 초대하세요"
          colorKey="blue"
        >
          <div className="flex flex-col items-center gap-4 w-full">
            {/* Quick Start 버튼 */}
            <div className="flex flex-col w-full gap-2">
              <div className="flex w-full gap-2 items-center">
                <Label htmlFor="password" className="text-sm">
                  비밀번호 설정
                </Label>
                <Checkbox
                  id="password"
                  name="password"
                  checked={isPassword}
                  className="border-gray-400"
                  onCheckedChange={(e) => setIsPassword(e.valueOf() as boolean)}
                />
              </div>
              <Input
                type="password"
                minLength={1}
                maxLength={16}
                className="flex-1 border-gray-400 pt-4 pb-4"
                placeholder="비밀번호를 입력할 수 있습니다."
                value={password}
                disabled={!isPassword}
                aria-disabled={!isPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <Button
              onClick={handleQuickStart}
              disabled={isCreating}
              className={`w-full h-14 text-lg shadow-md transition-all duration-200 
                ${createRoomError ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5'} 
                text-white rounded-xl flex items-center justify-center gap-2 font-mono`}
            >
              {isCreating ? 'Creating...' : 'Quick Start'}
            </Button>

            {/* Custom Start Popover Trigger */}
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  disabled={isCreating}
                  className="w-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors h-10 text-sm font-mono"
                >
                  <Settings2 className="w-4 h-4 mr-2" />
                  Custom Start
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="w-80 p-0 bg-white shadow-2xl border-gray-100 rounded-xl overflow-hidden"
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
          <div className="flex flex-col items-center gap-6 w-full">
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
                className={`
                  group relative w-full h-14 overflow-hidden rounded-xl text-lg font-bold transition-all duration-300 flex items-center justify-center gap-2
                  disabled:bg-none disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed
                  bg-gradient-to-br from-brand-green to-emerald-600 
                  text-white 
                  shadow-lg shadow-brand-green/20
                  hover:to-brand-green 
                  hover:shadow-brand-green/40 
                  hover:-translate-y-0.5
                `}
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
