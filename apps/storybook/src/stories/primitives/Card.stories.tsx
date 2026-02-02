import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@codejam/ui';
import { RadixButton as Button } from '@codejam/ui';

const meta = {
  title: 'Primitives/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'sm'],
      description: '카드 크기',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-[350px]">
      <CardHeader>
        <CardTitle>카드 제목</CardTitle>
        <CardDescription>카드 설명입니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>카드 내용이 여기에 표시됩니다.</p>
      </CardContent>
      <CardFooter>
        <Button>확인</Button>
      </CardFooter>
    </Card>
  ),
};

export const Size: Story = {
  args: {
    size: 'sm',
  },
  render: (args) => (
    <Card {...args} className="w-[350px]">
      <CardHeader>
        <CardTitle>작은 카드</CardTitle>
        <CardDescription>작은 크기의 카드입니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">내용</p>
      </CardContent>
    </Card>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>알림 설정</CardTitle>
        <CardDescription>알림 설정을 관리하세요.</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm">
            편집
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>모든 알림을 받을 수 있습니다.</p>
      </CardContent>
    </Card>
  ),
};

export const WithImage: Story = {
  render: () => (
    <Card className="w-[350px]">
      <img
        src="https://picsum.photos/350/200"
        alt="카드 이미지"
        className="w-full object-cover"
      />
      <CardHeader>
        <CardTitle>이미지 카드</CardTitle>
        <CardDescription>이미지가 포함된 카드입니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>이미지와 함께 내용을 표시할 수 있습니다.</p>
      </CardContent>
    </Card>
  ),
};

export const OnlyHeader: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>간단한 카드</CardTitle>
        <CardDescription>헤더만 있는 카드입니다.</CardDescription>
      </CardHeader>
    </Card>
  ),
};

export const Layout: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>카드 1</CardTitle>
        </CardHeader>
        <CardContent>
          <p>첫 번째 카드</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>카드 2</CardTitle>
        </CardHeader>
        <CardContent>
          <p>두 번째 카드</p>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardHeader>
          <CardTitle>작은 카드 1</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">세 번째 카드</p>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardHeader>
          <CardTitle>작은 카드 2</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">네 번째 카드</p>
        </CardContent>
      </Card>
    </div>
  ),
};
