import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@codejam/ui';
import { SearchIcon, CopyIcon } from 'lucide-react';

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

export const WithIcon: Story = {
  render: () => (
    <InputGroup className="w-[300px]">
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search..." />
    </InputGroup>
  ),
};

export const WithText: Story = {
  render: () => (
    <InputGroup className="w-[300px]">
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="example.com" />
    </InputGroup>
  ),
};

export const WithButton: Story = {
  render: () => (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <InputGroup className="w-[300px]">
        <InputGroupInput placeholder="Email" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton>Subscribe</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const WithDropdown: Story = {
  render: () => (
    <InputGroup className="w-[350px]">
      <InputGroupAddon>
        <Select defaultValue="https">
          <SelectTrigger className="w-[110px] rounded-none border-0 shadow-none focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Protocol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="http">http://</SelectItem>
            <SelectItem value="https">https://</SelectItem>
            <SelectItem value="ftp">ftp://</SelectItem>
          </SelectContent>
        </Select>
      </InputGroupAddon>
      <InputGroupInput placeholder="example.com" />
    </InputGroup>
  ),
};
