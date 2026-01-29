import { Hash } from 'lucide-react';
import { Card, CardContent } from '@codejam/ui';
import { CardHeading } from '../components/CardHeading';
import { RoomCodeInput } from '../components/RoomCodeInput';
import { JoinRoomButton } from '../components/JoinRoomButton';
import { ErrorMessage } from '../components/ErrorMessage';
import { useJoinRoom } from '../hooks/useJoinRoom';
import { cardColorSchemes } from '../constants/card-color-schemes';

const colors = cardColorSchemes.green;

export function JoinRoomCard() {
  const {
    roomCode,
    setRoomCode,
    error,
    isLoading,
    isCodeComplete,
    handleJoinRoom,
  } = useJoinRoom();

  return (
    <Card
      className={`rounded-3xl shadow-lg ring-2 ring-transparent transition-shadow ${colors.hoverRing}`}
    >
      <CardHeading
        icon={Hash}
        title="방 번호로 입장"
        description="공유받은 6자리 방 코드를 입력하여 참여하세요"
        colorKey="green"
      />
      <CardContent className="flex flex-col items-center gap-6 px-8 pt-6 pb-10">
        <RoomCodeInput
          value={roomCode}
          onChange={setRoomCode}
          hasError={!!error}
          onSubmit={handleJoinRoom}
          colorKey="green"
        />

        <div className="w-full space-y-3">
          <JoinRoomButton
            onClick={handleJoinRoom}
            isLoading={isLoading}
            disabled={!isCodeComplete}
          />
          <ErrorMessage message={error} />
        </div>
      </CardContent>
    </Card>
  );
}
