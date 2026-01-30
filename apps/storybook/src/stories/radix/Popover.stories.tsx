import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  RadixPopover as Popover,
  RadixPopoverContent as PopoverContent,
  RadixPopoverTrigger as PopoverTrigger,
  RadixButton as Button,
  RadixInput as Input,
  RadixLabel as Label,
} from '@codejam/ui';

const meta = {
  title: 'Radix/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">팝오버 열기</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <h4 className="font-medium leading-none">팝오버 제목</h4>
          <p className="text-sm text-muted-foreground">
            팝오버 내용이 여기에 표시됩니다.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">설정</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">설정</h4>
            <p className="text-sm text-muted-foreground">
              알림 설정을 변경하세요.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">너비</Label>
              <Input
                id="width"
                defaultValue="100%"
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">높이</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

export const Side: Story = {
  render: () => (
    <div className="flex gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">상단</Button>
        </PopoverTrigger>
        <PopoverContent side="top">
          <p className="text-sm">상단에 표시됩니다</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">하단</Button>
        </PopoverTrigger>
        <PopoverContent side="bottom">
          <p className="text-sm">하단에 표시됩니다</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">좌측</Button>
        </PopoverTrigger>
        <PopoverContent side="left">
          <p className="text-sm">좌측에 표시됩니다</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">우측</Button>
        </PopoverTrigger>
        <PopoverContent side="right">
          <p className="text-sm">우측에 표시됩니다</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
};
