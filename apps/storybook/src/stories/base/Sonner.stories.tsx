import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadixToaster as Toaster, Button, toast } from '@codejam/ui';

const meta = {
  title: 'Base/Sonner',
  component: Toaster,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="space-y-2">
      <Toaster />
      <Button onClick={() => toast('기본 토스트 메시지입니다.')}>
        기본 토스트
      </Button>
    </div>
  ),
};

export const Types: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Toaster />
      <Button onClick={() => toast.success('성공적으로 저장되었습니다.')}>
        성공
      </Button>
      <Button onClick={() => toast.error('오류가 발생했습니다.')}>에러</Button>
      <Button onClick={() => toast.warning('주의가 필요합니다.')}>경고</Button>
      <Button onClick={() => toast.info('새로운 업데이트가 있습니다.')}>
        정보
      </Button>
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="space-y-2">
      <Toaster />
      <Button
        onClick={() =>
          toast.message('일정 알림', {
            description: '월요일 오전 9시에 팀 미팅이 있습니다.',
          })
        }
      >
        설명 포함
      </Button>
    </div>
  ),
};

export const WithAction: Story = {
  render: () => (
    <div className="space-y-2">
      <Toaster />
      <Button
        onClick={() =>
          toast('파일이 삭제되었습니다.', {
            action: {
              label: '실행 취소',
              onClick: () => console.log('Undo'),
            },
          })
        }
      >
        액션 포함
      </Button>
    </div>
  ),
};

export const PositionTopCenter: Story = {
  render: () => (
    <div className="space-y-2">
      <Toaster position="top-center" />
      <Button onClick={() => toast('상단 중앙에 표시됩니다.')}>
        Top Center
      </Button>
    </div>
  ),
};
