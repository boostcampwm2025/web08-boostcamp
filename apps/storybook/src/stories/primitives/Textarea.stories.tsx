import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea, Label } from '@codejam/ui';

const meta = {
  title: 'Primitives/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: '플레이스홀더',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
    rows: {
      control: 'number',
      description: '행 수',
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: '내용을 입력하세요...',
  },
  render: (args) => (
    <div className="w-[400px] space-y-2">
      <Label htmlFor="textarea">메시지</Label>
      <Textarea id="textarea" {...args} />
    </div>
  ),
};

export const WithValue: Story = {
  args: {
    defaultValue: '이미 입력된 내용입니다.\n여러 줄로 작성할 수 있습니다.',
  },
  render: (args) => (
    <div className="w-[400px] space-y-2">
      <Label htmlFor="textarea-value">내용</Label>
      <Textarea id="textarea-value" {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: '비활성화된 텍스트 영역',
    disabled: true,
  },
  render: (args) => (
    <div className="w-[400px] space-y-2">
      <Label htmlFor="textarea-disabled">메시지 (비활성화)</Label>
      <Textarea id="textarea-disabled" {...args} />
    </div>
  ),
};

export const WithRows: Story = {
  args: {
    placeholder: '10줄 크기의 텍스트 영역',
    rows: 10,
  },
  render: (args) => (
    <div className="w-[400px] space-y-2">
      <Label htmlFor="textarea-rows">긴 내용</Label>
      <Textarea id="textarea-rows" {...args} />
    </div>
  ),
};

export const Required: Story = {
  args: {
    placeholder: '필수 입력 항목',
    required: true,
  },
  render: (args) => (
    <div className="w-[400px] space-y-2">
      <Label htmlFor="textarea-required">
        피드백 <span className="text-destructive">*</span>
      </Label>
      <Textarea id="textarea-required" {...args} />
      <p className="text-xs text-muted-foreground">이 항목은 필수입니다.</p>
    </div>
  ),
};

export const MaxLength: Story = {
  args: {
    placeholder: '최대 200자까지 입력 가능',
    maxLength: 200,
  },
  render: (args) => (
    <div className="w-[400px] space-y-2">
      <Label htmlFor="textarea-maxlength">코멘트</Label>
      <Textarea id="textarea-maxlength" {...args} />
      <p className="text-xs text-muted-foreground">최대 200자</p>
    </div>
  ),
};
