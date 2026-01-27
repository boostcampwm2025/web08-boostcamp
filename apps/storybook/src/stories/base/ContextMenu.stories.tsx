import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@codejam/ui';

const meta = {
  title: 'Base/ContextMenu',
  component: ContextMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        우클릭하세요
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>뒤로 가기</ContextMenuItem>
        <ContextMenuItem>앞으로 가기</ContextMenuItem>
        <ContextMenuItem>새로고침</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>다른 이름으로 저장...</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};
