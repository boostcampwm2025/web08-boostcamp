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
  args: {
    children: 'Button',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Destructive',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost',
    variant: 'ghost',
  },
};

export const Link: Story = {
  args: {
    children: 'Link',
    variant: 'link',
  },
};

export const Icon: Story = {
  args: {
    size: 'icon',
    variant: 'outline',
    children: <ChevronRight />,
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Mail /> Login with Email
      </>
    ),
  },
};

export const Rounded: Story = {
  args: {
    className: 'rounded-full',
    children: 'Rounded Button',
  },
};

export const Spinner: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Loader2 className="animate-spin" />
        Please wait
      </>
    ),
  },
};

export const AsLink: Story = {
  args: {
    render: <a href="#" />,
    children: 'Login',
  },
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
