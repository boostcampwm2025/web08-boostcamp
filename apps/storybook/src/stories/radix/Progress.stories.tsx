import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadixProgress as Progress } from '@codejam/ui';

const meta = {
  title: 'Radix/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: '진행률 (0-100)',
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
  },
  render: (args) => (
    <div className="w-[300px]">
      <Progress {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: {
    value: 0,
  },
  render: (args) => (
    <div className="w-[300px] space-y-2">
      <div className="text-sm text-muted-foreground">다운로드 시작 전</div>
      <Progress {...args} />
    </div>
  ),
};

export const Half: Story = {
  args: {
    value: 50,
  },
  render: (args) => (
    <div className="w-[300px] space-y-2">
      <div className="text-sm text-muted-foreground">다운로드 중... 50%</div>
      <Progress {...args} />
    </div>
  ),
};

export const Complete: Story = {
  args: {
    value: 100,
  },
  render: (args) => (
    <div className="w-[300px] space-y-2">
      <div className="text-sm text-muted-foreground">다운로드 완료!</div>
      <Progress {...args} />
    </div>
  ),
};
