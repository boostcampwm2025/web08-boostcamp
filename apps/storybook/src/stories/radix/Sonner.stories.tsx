import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadixToaster as Toaster, RadixButton as Button } from '@codejam/ui';
import { toast } from 'sonner';

const meta = {
  title: 'Radix/Sonner',
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

export const Success: Story = {
  render: () => (
    <div className="space-y-2">
      <Toaster />
      <Button onClick={() => toast.success('성공적으로 저장되었습니다.')}>
        성공 토스트
      </Button>
    </div>
  ),
};

export const Error: Story = {
  render: () => (
    <div className="space-y-2">
      <Toaster />
      <Button onClick={() => toast.error('오류가 발생했습니다.')}>
        에러 토스트
      </Button>
    </div>
  ),
};

export const Warning: Story = {
  render: () => (
    <div className="space-y-2">
      <Toaster />
      <Button onClick={() => toast.warning('주의가 필요합니다.')}>
        경고 토스트
      </Button>
    </div>
  ),
};

export const Info: Story = {
  render: () => (
    <div className="space-y-2">
      <Toaster />
      <Button onClick={() => toast.info('알림: 새로운 업데이트가 있습니다.')}>
        정보 토스트
      </Button>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="space-y-2">
      <Toaster />
      <Button
        onClick={() => {
          const loadingToast = toast.loading('로딩 중...');
          setTimeout(() => {
            toast.success('완료되었습니다!', { id: loadingToast });
          }, 2000);
        }}
      >
        로딩 토스트
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
          toast('이벤트가 생성되었습니다.', {
            action: {
              label: '실행 취소',
              onClick: () => toast.info('실행 취소됨'),
            },
          })
        }
      >
        액션 포함 토스트
      </Button>
    </div>
  ),
};

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Toaster />
      <Button onClick={() => toast('기본 메시지')}>기본</Button>
      <Button onClick={() => toast.success('성공!')}>성공</Button>
      <Button onClick={() => toast.error('오류 발생')}>에러</Button>
      <Button onClick={() => toast.warning('경고')}>경고</Button>
      <Button onClick={() => toast.info('정보')}>정보</Button>
      <Button onClick={() => toast.loading('로딩...')}>로딩</Button>
    </div>
  ),
};
