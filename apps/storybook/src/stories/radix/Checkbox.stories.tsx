import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadixCheckbox as Checkbox, RadixLabel as Label } from '@codejam/ui';

const meta = {
  title: 'Radix/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: '체크 상태',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="checkbox" {...args} />
      <Label htmlFor="checkbox">동의합니다</Label>
    </div>
  ),
};

export const Checked: Story = {
  args: {
    checked: true,
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="checkbox-checked" {...args} />
      <Label htmlFor="checkbox-checked">동의합니다</Label>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id="checkbox-disabled" {...args} />
      <Label htmlFor="checkbox-disabled">동의합니다 (비활성화)</Label>
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
      <Checkbox id="checkbox-checked-disabled" {...args} />
      <Label htmlFor="checkbox-checked-disabled">동의합니다 (비활성화)</Label>
    </div>
  ),
};
