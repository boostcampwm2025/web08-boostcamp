import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider, Label } from '@codejam/ui';
import { useState } from 'react';

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

export const MultipleThumbs: Story = {
  args: {
    defaultValue: [10, 40, 70, 90],
    max: 100,
  },
  render: (args) => (
    <div className="w-[300px] space-y-4">
      <Label>다중 선택</Label>
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

export const Vertical: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    orientation: 'vertical',
  },
  render: (args) => (
    <div className="flex h-[200px] items-center gap-4">
      <Slider {...args} />
    </div>
  ),
};

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState([50]);
    return (
      <div className="w-[300px] space-y-4">
        <Label>현재 값: {value[0]}</Label>
        <Slider
          {...args}
          value={value}
          onValueChange={(vals) => setValue(vals)}
          max={100}
          step={1}
        />
      </div>
    );
  },
};
