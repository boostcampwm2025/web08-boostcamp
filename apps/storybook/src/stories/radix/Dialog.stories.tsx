import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  RadixDialog as Dialog,
  RadixDialogContent as DialogContent,
  RadixDialogDescription as DialogDescription,
  RadixDialogFooter as DialogFooter,
  RadixDialogHeader as DialogHeader,
  RadixDialogTitle as DialogTitle,
  RadixDialogTrigger as DialogTrigger,
  RadixButton as Button,
  RadixInput as Input,
  RadixLabel as Label,
} from '@codejam/ui';

const meta = {
  title: 'Radix/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>다이얼로그 열기</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>제목</DialogTitle>
          <DialogDescription>다이얼로그 설명입니다.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>다이얼로그 내용이 여기에 표시됩니다.</p>
        </div>
        <DialogFooter>
          <Button>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>프로필 수정</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>프로필 수정</DialogTitle>
          <DialogDescription>
            프로필 정보를 수정하세요. 완료되면 저장 버튼을 클릭하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">이름</Label>
            <Input id="name" defaultValue="홍길동" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" defaultValue="hong@example.com" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const NoCloseButton: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>닫기 버튼 없음</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>알림</DialogTitle>
          <DialogDescription>
            닫기 버튼이 없는 다이얼로그입니다.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>ESC 키나 외부 클릭으로 닫을 수 있습니다.</p>
        </div>
        <DialogFooter>
          <Button>확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
