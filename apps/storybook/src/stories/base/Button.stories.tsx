import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, ButtonGroup } from '@codejam/ui';
import { ChevronRight, Loader2, Mail } from 'lucide-react';

const meta = {
  title: 'Base/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
      description: 'The visual style of the button',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
      description: 'The size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Button>Button</Button>,
};

export const Secondary: Story = {
  render: () => <Button variant="secondary">Secondary</Button>,
};

export const Destructive: Story = {
  render: () => <Button variant="destructive">Destructive</Button>,
};

export const Outline: Story = {
  render: () => <Button variant="outline">Outline</Button>,
};

export const Ghost: Story = {
  render: () => <Button variant="ghost">Ghost</Button>,
};

export const Link: Story = {
  render: () => <Button variant="link">Link</Button>,
};

export const Icon: Story = {
  render: () => (
    <Button size="icon" variant="outline">
      <ChevronRight />
    </Button>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Button>
      <Mail /> Login with Email
    </Button>
  ),
};

export const Rounded: Story = {
  render: () => <Button className="rounded-full">Rounded Button</Button>,
};

export const Spinner: Story = {
  render: () => (
    <Button disabled>
      <Loader2 className="animate-spin" />
      Please wait
    </Button>
  ),
};

export const AsLink: Story = {
  render: () => <Button render={<a href="#" />}>Login</Button>,
};

export const ButtonGroupUsage: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Year</Button>
      <Button variant="outline">Month</Button>
      <Button variant="outline">Day</Button>
    </ButtonGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-center">
      <div className="flex gap-2 items-center">
        <Button size="default">Default</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
      </div>
      <div className="flex gap-2 items-center">
        <Button size="icon" variant="outline">
          <ChevronRight />
        </Button>
        <Button size="icon-sm" variant="outline">
          <ChevronRight />
        </Button>
        <Button size="icon-lg" variant="outline">
          <ChevronRight />
        </Button>
      </div>
    </div>
  ),
};
