import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadixSlider as Slider, RadixLabel as Label } from '@codejam/ui';

const meta = {
  title: 'Radix/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    min: {
      control: 'number',
      description: '최소값',
    },
    max: {
      control: 'number',
      description: '최대값',
    },
    step: {
      control: 'number',
      description: '단계',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
  },
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
