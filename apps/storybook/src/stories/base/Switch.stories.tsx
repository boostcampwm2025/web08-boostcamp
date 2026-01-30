import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch, Label } from '@codejam/ui';

const meta = {
  title: 'Base/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Switch id="switch-base" {...args} />
      <Label htmlFor="switch-base">알림 받기</Label>
    </div>
  ),
};

export const Checked: Story = {
  args: {
    checked: true,
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Switch id="switch-base-checked" {...args} />
      <Label htmlFor="switch-base-checked">알림 받기</Label>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Switch id="switch-base-disabled" {...args} />
      <Label htmlFor="switch-base-disabled">알림 받기 (비활성화)</Label>
    </div>
  ),
};
