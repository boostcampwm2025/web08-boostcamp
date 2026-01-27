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

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Toaster />
      <Button onClick={() => toast('기본 메시지')}>기본</Button>
      <Button onClick={() => toast.success('성공!')}>성공</Button>
      <Button onClick={() => toast.error('오류 발생')}>에러</Button>
      <Button onClick={() => toast.warning('경고')}>경고</Button>
      <Button onClick={() => toast.info('정보')}>정보</Button>
    </div>
  ),
};
