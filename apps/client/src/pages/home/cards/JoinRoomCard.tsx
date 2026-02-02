import { Hash } from 'lucide-react';
import { Card, CardContent } from '@codejam/ui';
import { CardHeading } from '../components/CardHeading';
import { ErrorMessage } from '../components/ErrorMessage';
import { JoinRoomButton } from '../components/JoinRoomButton';
import { useJoinRoom } from '../hooks/useJoinRoom';
import {
  cardColorSchemes,
  CARD_BASE_STYLES,
} from '../constants/card-color-schemes';
import { RoomCodeOtpInput } from '../components/RoomCodeOtpInput';

const colors = cardColorSchemes.green;

export function JoinRoomCard() {
  const {
    roomCode,
    handleChangeRoomCode,
    handleJoinRoom,
    isLoading,
    errorMessage,
    errorKey,
    isCodeComplete,
  } = useJoinRoom();

  return (
    <Card className={`${CARD_BASE_STYLES} ${colors.hoverRing}`}>
      <CardHeading
        icon={Hash}
        title="방 번호로 입장"
        description="공유받은 6자리 방 코드를 입력하여 참여하세요"
        colorKey="green"
      />
      <CardContent className="flex flex-col items-center gap-4">
        <RoomCodeOtpInput
          value={roomCode}
          onChange={handleChangeRoomCode}
          onSubmit={handleJoinRoom}
          disabled={isLoading}
          invalid={!!errorMessage}
          errorKey={errorKey}
        />

        <div className="w-full space-y-2">
          <JoinRoomButton
            onClick={handleJoinRoom}
            disabled={!isCodeComplete || isLoading || !!errorMessage}
            isLoading={isLoading}
          />
          <ErrorMessage message={errorMessage} />
        </div>
      </CardContent>
    </Card>
  );
}
