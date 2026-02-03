import type { Meta, StoryObj } from '@storybook/react-vite';
import { Separator } from '@codejam/ui';

const meta = {
  title: 'Base/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: '구분선 방향',
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-64">
      <div className="text-sm">위쪽 콘텐츠</div>
      <Separator orientation="horizontal" className="my-4" />
      <div className="text-sm">아래쪽 콘텐츠</div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-5 items-center space-x-4 text-sm">
      <div>블로그</div>
      <Separator orientation="vertical" />
      <div>문서</div>
      <Separator orientation="vertical" />
      <div>소스</div>
    </div>
  ),
};

export const InList: Story = {
  render: () => (
    <div className="w-64 space-y-2">
      <div className="text-sm font-medium">항목 1</div>
      <Separator />
      <div className="text-sm font-medium">항목 2</div>
      <Separator />
      <div className="text-sm font-medium">항목 3</div>
    </div>
  ),
};

export const Menu: Story = {
  render: () => (
    <div className="border-border bg-background w-64 rounded-md border p-4 shadow-sm">
      <div className="mb-4">
        <h4 className="text-sm font-medium leading-none">크기</h4>
        <p className="text-muted-foreground text-sm">치수를 선택하세요.</p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Small</div>
        <Separator orientation="vertical" />
        <div>Medium</div>
        <Separator orientation="vertical" />
        <div>Large</div>
      </div>
    </div>
  ),
};
