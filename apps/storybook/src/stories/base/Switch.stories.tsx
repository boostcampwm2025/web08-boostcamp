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

export const WithDescription: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Switch id="switch-description" {...args} />
      <div className="grid gap-1.5 leading-none">
        <Label htmlFor="switch-description">비행 모드</Label>
        <p className="text-muted-foreground text-sm">
          비행 모드를 켜면 모든 무선 통신이 차단됩니다.
        </p>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Switch id="switch-sm" size="sm" {...args} />
        <Label htmlFor="switch-sm">Small Size</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="switch-default" size="default" {...args} />
        <Label htmlFor="switch-default">Default Size</Label>
      </div>
    </div>
  ),
};

export const Invalid: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Switch id="switch-invalid" aria-invalid {...args} />
      <Label htmlFor="switch-invalid" className="text-destructive">
        동의 필요
      </Label>
    </div>
  ),
};

export const ChoiceCard: Story = {
  render: (args) => (
    <div className="border-input flex w-[300px] items-center justify-between rounded-lg border p-4 shadow-sm">
      <div className="space-y-0.5">
        <Label htmlFor="switch-card">마케팅 수신 동의</Label>
        <p className="text-muted-foreground text-sm">
          이메일로 마케팅 정보를 받습니다.
        </p>
      </div>
      <Switch id="switch-card" {...args} />
    </div>
  ),
};
