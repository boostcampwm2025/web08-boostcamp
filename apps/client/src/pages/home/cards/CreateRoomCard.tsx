import { Users } from 'lucide-react';
import { Card, CardContent } from '@codejam/ui';
import { CardHeading } from '../components/CardHeading';
import { QuickStartButton } from '../components/QuickStartButton';
import { CustomStartButton } from '../components/CustomStartButton';
import { ErrorMessage } from '../components/ErrorMessage';
import { useCreateRoom } from '../hooks/useCreateRoom';
import { cardColorSchemes } from '../constants/card-color-schemes';

const colors = cardColorSchemes.blue;

export function CreateRoomCard() {
  const {
    error,
    isLoading,
    isPopoverOpen,
    setIsPopoverOpen,
    handleQuickStart,
    handleCustomStart,
  } = useCreateRoom();

  return (
    <Card
      className={`rounded-3xl shadow-lg ring-2 ring-transparent transition-shadow ${colors.hoverRing}`}
    >
      <CardHeading
        icon={Users}
        title="방 만들기"
        description="새로운 협업 공간을 생성하고 팀원들을 초대하세요"
        colorKey="blue"
      />
      <CardContent className="flex flex-col gap-4 px-8 pt-6 pb-10">
        <QuickStartButton
          onClick={handleQuickStart}
          isLoading={isLoading}
          hasError={!!error}
        />
        <CustomStartButton
          isOpen={isPopoverOpen}
          onOpenChange={setIsPopoverOpen}
          onCreate={handleCustomStart}
          isLoading={isLoading}
        />
        <ErrorMessage message={error} />
      </CardContent>
    </Card>
  );
}
