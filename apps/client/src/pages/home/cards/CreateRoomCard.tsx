import { Users, Settings2 } from 'lucide-react';
import {
  Card,
  CardContent,
  RadixButton as Button,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@codejam/ui';
import { CardHeading } from '../components/CardHeading';
import { QuickStartButton } from '../components/QuickStartButton';
import { CustomRoomForm } from '../components/CustomRoomForm';
import { ErrorMessage } from '../components/ErrorMessage';
import { useCreateRoom } from '../hooks/useCreateRoom';
import {
  cardColorSchemes,
  CARD_BASE_STYLES,
} from '../constants/card-color-schemes';

const colors = cardColorSchemes.blue;

export function CreateRoomCard() {
  const {
    error,
    isLoading,
    isFormOpen,
    toggleForm,
    handleQuickStart,
    handleCustomStart,
  } = useCreateRoom();

  return (
    <Card
      className={`${CARD_BASE_STYLES} ${colors.hoverRing} relative flex h-full overflow-hidden`}
    >
      <CardHeading
        icon={Users}
        title="방 만들기"
        description="새로운 협업 공간을 생성하고 팀원들을 초대하세요"
        colorKey="blue"
      />
      <CardContent className="flex flex-col">
        <Tooltip>
          <TooltipTrigger
            render={(props) => (
              <QuickStartButton
                {...props}
                onClick={handleQuickStart}
                isLoading={isLoading}
                hasError={!!error}
              />
            )}
          />
          <TooltipContent>호스트 없이 모두 편집 가능 (6명 정원)</TooltipContent>
        </Tooltip>

        <Button
          variant="ghost"
          onClick={toggleForm}
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl text-base whitespace-nowrap text-gray-500 transition-colors hover:bg-transparent hover:text-blue-600 disabled:pointer-events-none disabled:opacity-50"
        >
          <Settings2 className="size-5" />
          세부 설정
        </Button>
        <ErrorMessage message={error} />
      </CardContent>

      <div
        className={`bg-background absolute inset-0 h-full w-full transition-all duration-500 ease-in-out ${
          isFormOpen ? 'left-0 opacity-100' : 'left-full opacity-0'
        }`}
      >
        <CustomRoomForm
          onCancel={toggleForm}
          onCreate={handleCustomStart}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </Card>
  );
}
