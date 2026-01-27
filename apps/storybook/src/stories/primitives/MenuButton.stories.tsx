import type { Meta, StoryObj } from '@storybook/react-vite';
import { MenuButton } from '@codejam/ui';
import { toast } from 'sonner';
import { RadixToaster as Toaster } from '@codejam/ui';

const meta = {
  title: 'Primitives/MenuButton',
  component: MenuButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: '버튼 라벨',
    },
  },
} satisfies Meta<typeof MenuButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: '메뉴',
    onClick: () => alert('클릭됨'),
  },
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toaster />
      <MenuButton label="⋮" onClick={() => toast('세로 메뉴 클릭')} />
      <MenuButton label="⋯" onClick={() => toast('가로 메뉴 클릭')} />
      <MenuButton label="⚙️" onClick={() => toast('설정 클릭')} />
      <MenuButton label="✕" onClick={() => toast('닫기 클릭')} />
    </div>
  ),
};

export const DifferentLabels: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toaster />
      <MenuButton label="편집" onClick={() => toast('편집 클릭')} />
      <MenuButton label="삭제" onClick={() => toast('삭제 클릭')} />
      <MenuButton label="공유" onClick={() => toast('공유 클릭')} />
      <MenuButton label="저장" onClick={() => toast('저장 클릭')} />
    </div>
  ),
};

export const WithCustomClass: Story = {
  render: () => (
    <div className="flex gap-2">
      <MenuButton
        label="⋮"
        className="hover:bg-blue-100 dark:hover:bg-blue-900 rounded p-2"
        onClick={() => alert('커스텀 스타일')}
      />
      <MenuButton
        label="⚙️"
        className="hover:bg-red-100 dark:hover:bg-red-900 rounded p-2"
        onClick={() => alert('커스텀 스타일')}
      />
    </div>
  ),
};

export const InCardHeader: Story = {
  render: () => (
    <div className="w-[350px] rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">카드 제목</h3>
          <p className="text-sm text-muted-foreground">카드 설명</p>
        </div>
        <MenuButton label="⋮" onClick={() => alert('메뉴')} />
      </div>
      <div className="mt-4">
        <p className="text-sm">카드 내용입니다.</p>
      </div>
    </div>
  ),
};
