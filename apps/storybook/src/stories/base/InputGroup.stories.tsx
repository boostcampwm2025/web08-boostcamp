import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputGroup } from '@codejam/ui';

const meta = {
  title: 'Base/InputGroup',
  component: InputGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <InputGroup className="w-[300px]">
      <input
        type="text"
        placeholder="입력 그룹"
        className="flex-1 bg-transparent px-3 outline-none"
      />
    </InputGroup>
  ),
};

export const WithAddon: Story = {
  render: () => (
    <InputGroup className="w-[300px]">
      <span className="px-3 text-sm text-muted-foreground">https://</span>
      <input
        type="text"
        placeholder="example.com"
        className="flex-1 bg-transparent px-3 outline-none"
      />
    </InputGroup>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div className="space-y-4 w-[300px]">
      <InputGroup>
        <span className="px-3 text-sm text-muted-foreground">$</span>
        <input
          type="number"
          placeholder="0.00"
          className="flex-1 bg-transparent px-3 outline-none"
        />
      </InputGroup>
      <InputGroup>
        <input
          type="text"
          placeholder="이메일"
          className="flex-1 bg-transparent px-3 outline-none"
        />
        <span className="px-3 text-sm text-muted-foreground">@gmail.com</span>
      </InputGroup>
    </div>
  ),
};
