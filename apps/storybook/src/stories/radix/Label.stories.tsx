import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadixLabel as Label, RadixInput as Input } from '@codejam/ui';

const meta = {
  title: 'Radix/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: '라벨',
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="name">이름</Label>
      <Input id="name" placeholder="이름을 입력하세요" />
    </div>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <input type="checkbox" id="terms" />
      <Label htmlFor="terms">이용약관에 동의합니다</Label>
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="email">
        이메일 <span className="text-destructive">*</span>
      </Label>
      <Input id="email" type="email" placeholder="email@example.com" required />
    </div>
  ),
};
