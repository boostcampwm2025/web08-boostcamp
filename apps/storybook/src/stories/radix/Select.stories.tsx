import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  RadixSelect as Select,
  RadixSelectContent as SelectContent,
  RadixSelectItem as SelectItem,
  RadixSelectTrigger as SelectTrigger,
  RadixSelectValue as SelectValue,
  RadixSelectGroup as SelectGroup,
  RadixSelectLabel as SelectLabel,
  RadixSelectSeparator as SelectSeparator,
} from '@codejam/ui';

const meta = {
  title: 'Radix/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="선택하세요" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">옵션 1</SelectItem>
        <SelectItem value="option2">옵션 2</SelectItem>
        <SelectItem value="option3">옵션 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="과일 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>과일</SelectLabel>
          <SelectItem value="apple">사과</SelectItem>
          <SelectItem value="banana">바나나</SelectItem>
          <SelectItem value="orange">오렌지</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>채소</SelectLabel>
          <SelectItem value="carrot">당근</SelectItem>
          <SelectItem value="potato">감자</SelectItem>
          <SelectItem value="onion">양파</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const Small: Story = {
  render: () => (
    <Select>
      <SelectTrigger size="sm" className="w-[150px]">
        <SelectValue placeholder="작은 크기" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">1</SelectItem>
        <SelectItem value="2">2</SelectItem>
        <SelectItem value="3">3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="비활성화" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">옵션 1</SelectItem>
      </SelectContent>
    </Select>
  ),
};
