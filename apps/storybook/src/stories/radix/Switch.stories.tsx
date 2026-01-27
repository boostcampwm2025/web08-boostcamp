import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadixSwitch as Switch, RadixLabel as Label } from '@codejam/ui';

const meta = {
  title: 'Radix/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: '활성화 상태',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Switch id="switch" {...args} />
      <Label htmlFor="switch">알림 받기</Label>
    </div>
  ),
};

export const Checked: Story = {
  args: {
    checked: true,
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Switch id="switch-checked" {...args} />
      <Label htmlFor="switch-checked">알림 받기</Label>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Switch id="switch-disabled" {...args} />
      <Label htmlFor="switch-disabled">알림 받기 (비활성화)</Label>
    </div>
  ),
};

export const CheckedDisabled: Story = {
  args: {
    checked: true,
    disabled: true,
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Switch id="switch-checked-disabled" {...args} />
      <Label htmlFor="switch-checked-disabled">알림 받기 (비활성화)</Label>
    </div>
  ),
};
