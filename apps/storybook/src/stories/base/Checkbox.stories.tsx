import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox, Label } from '@codejam/ui';

const meta = {
  title: 'Base/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="checkbox-base" {...args} />
      <Label htmlFor="checkbox-base">동의합니다</Label>
    </div>
  ),
};

export const Checked: Story = {
  args: {
    checked: true,
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="checkbox-base-checked" {...args} />
      <Label htmlFor="checkbox-base-checked">동의합니다</Label>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="checkbox-base-disabled" {...args} />
      <Label htmlFor="checkbox-base-disabled">동의합니다 (비활성화)</Label>
    </div>
  ),
};
