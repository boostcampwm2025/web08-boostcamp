import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from '@codejam/ui';
import { RadixInput as Input } from '@codejam/ui';

const meta = {
  title: 'Primitives/Label',
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
      <input type="checkbox" id="terms" className="size-4" />
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

export const WithDescription: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="password">비밀번호</Label>
      <Input id="password" type="password" placeholder="비밀번호 입력" />
      <p className="text-xs text-muted-foreground">
        최소 8자 이상, 영문과 숫자를 포함해야 합니다.
      </p>
    </div>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">사용자명</Label>
        <Input id="username" placeholder="username" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email2">이메일</Label>
        <Input id="email2" type="email" placeholder="email@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">소개</Label>
        <textarea
          id="bio"
          className="w-full rounded-md border p-2 text-sm"
          placeholder="자기소개를 입력하세요"
          rows={3}
        />
      </div>
    </div>
  ),
};
