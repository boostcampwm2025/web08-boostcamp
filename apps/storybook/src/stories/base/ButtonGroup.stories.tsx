import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@codejam/ui';
import { ChevronDown, MoreHorizontal } from 'lucide-react';

const meta = {
  title: 'Base/ButtonGroup',
  component: ButtonGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'The orientation of the button group',
    },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <ButtonGroup orientation="horizontal">
      <Button variant="outline">Left</Button>
      <Button variant="outline">Center</Button>
      <Button variant="outline">Right</Button>
    </ButtonGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="outline">Top</Button>
      <Button variant="outline">Middle</Button>
      <Button variant="outline">Bottom</Button>
    </ButtonGroup>
  ),
};

export const WithSeparator: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ButtonGroup orientation="horizontal">
        <Button variant="outline">Copy</Button>
        <ButtonGroupSeparator />
        <Button variant="outline">Paste</Button>
        <ButtonGroupSeparator />
        <Button variant="outline">Cut</Button>
      </ButtonGroup>
      <ButtonGroup orientation="vertical">
        <Button variant="outline">Copy</Button>
        <ButtonGroupSeparator />
        <Button variant="outline">Paste</Button>
        <ButtonGroupSeparator />
        <Button variant="outline">Cut</Button>
      </ButtonGroup>
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <ButtonGroup orientation="horizontal">
      <ButtonGroupText>Label</ButtonGroupText>
      <Button variant="outline">Action</Button>
    </ButtonGroup>
  ),
};

export const Split: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Option</Button>
      <ButtonGroupSeparator />
      <Button variant="outline" size="icon">
        <ChevronDown />
      </Button>
    </ButtonGroup>
  ),
};

export const WithInput: Story = {
  render: () => (
    <ButtonGroup className="w-full max-w-sm">
      <Input placeholder="Email" />
      <Button type="submit">Subscribe</Button>
    </ButtonGroup>
  ),
};

export const WithSelect: Story = {
  render: () => (
    <ButtonGroup>
      <Select defaultValue="option1">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline">Action</Button>
    </ButtonGroup>
  ),
};

export const Nested: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">File</Button>
      <Button variant="outline">Edit</Button>
      <ButtonGroupSeparator />
      <ButtonGroup>
        <Button variant="outline" size="icon">
          <MoreHorizontal />
        </Button>
        <Button variant="outline">More</Button>
      </ButtonGroup>
    </ButtonGroup>
  ),
};
