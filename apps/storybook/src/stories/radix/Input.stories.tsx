import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadixInput as Input, RadixLabel as Label } from '@codejam/ui';

const meta = {
  title: 'Radix/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      description: '입력 타입',
    },
    placeholder: {
      control: 'text',
      description: '플레이스홀더',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: '텍스트를 입력하세요',
  },
  render: (args) => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="input">이메일</Label>
      <Input id="input" {...args} />
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
      <Label htmlFor="input-email">이메일</Label>
      <Input id="input-email" {...args} />
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
      <Label htmlFor="input-password">비밀번호</Label>
      <Input id="input-password" {...args} />
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
      <Label htmlFor="input-disabled">입력 (비활성화)</Label>
      <Input id="input-disabled" {...args} />
    </div>
  ),
};

export const WithValue: Story = {
  args: {
    defaultValue: '입력된 값',
  },
  render: (args) => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="input-value">이름</Label>
      <Input id="input-value" {...args} />
    </div>
  ),
};
