import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  RadixContextMenu as ContextMenu,
  RadixContextMenuTrigger as ContextMenuTrigger,
  RadixContextMenuContent as ContextMenuContent,
  RadixContextMenuItem as ContextMenuItem,
  RadixContextMenuCheckboxItem as ContextMenuCheckboxItem,
  RadixContextMenuSeparator as ContextMenuSeparator,
  RadixContextMenuShortcut as ContextMenuShortcut,
  RadixContextMenuSub as ContextMenuSub,
  RadixContextMenuSubContent as ContextMenuSubContent,
  RadixContextMenuSubTrigger as ContextMenuSubTrigger,
} from '@codejam/ui';

const meta = {
  title: 'Radix/ContextMenu',
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
      <ContextMenuContent className="w-64">
        <ContextMenuItem>뒤로 가기</ContextMenuItem>
        <ContextMenuItem disabled>앞으로 가기</ContextMenuItem>
        <ContextMenuItem>새로고침</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>다른 이름으로 저장...</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithCheckboxes: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        우클릭하세요
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>프로필</ContextMenuItem>
        <ContextMenuItem>설정</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked>알림 표시</ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem>자동 업데이트</ContextMenuCheckboxItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithSubMenu: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        우클릭하세요
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>새 탭</ContextMenuItem>
        <ContextMenuItem>새 창</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>더 보기</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>개발자 도구</ContextMenuItem>
            <ContextMenuItem>작업 관리자</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>확장 프로그램</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem>북마크 추가</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithShortcuts: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        우클릭하세요
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>
          뒤로 가기
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          앞으로 가기
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          새로고침
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          저장
          <ContextMenuShortcut>⌘S</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};
