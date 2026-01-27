import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input, Label } from '@codejam/ui';

const meta = {
  title: 'Base/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: '텍스트를 입력하세요',
  },
  render: (args) => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="input-base">입력</Label>
      <Input id="input-base" {...args} />
    </div>
  ),
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'email@example.com',
  },
  render: (args) => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="input-base-email">이메일</Label>
      <Input id="input-base-email" {...args} />
    </div>
  ),
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: '비밀번호를 입력하세요',
  },
  render: (args) => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="input-base-password">비밀번호</Label>
      <Input id="input-base-password" {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: '비활성화된 입력',
    disabled: true,
  },
  render: (args) => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="input-base-disabled">입력 (비활성화)</Label>
      <Input id="input-base-disabled" {...args} />
    </div>
  ),
};
