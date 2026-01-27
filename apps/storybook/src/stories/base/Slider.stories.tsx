import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider, Label } from '@codejam/ui';

const meta = {
  title: 'Base/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: [50],
    max: 100,
  },
  render: (args) => (
    <div className="w-[300px] space-y-4">
      <Label>볼륨</Label>
      <Slider {...args} />
    </div>
  ),
};

export const Range: Story = {
  args: {
    defaultValue: [25, 75],
    max: 100,
  },
  render: (args) => (
    <div className="w-[300px] space-y-4">
      <Label>가격 범위</Label>
      <Slider {...args} />
    </div>
  ),
};

export const WithStep: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    step: 10,
  },
  render: (args) => (
    <div className="w-[300px] space-y-4">
      <Label>밝기 (10% 단위)</Label>
      <Slider {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    disabled: true,
  },
  render: (args) => (
    <div className="w-[300px] space-y-4">
      <Label>볼륨 (비활성화)</Label>
      <Slider {...args} />
    </div>
  ),
};
