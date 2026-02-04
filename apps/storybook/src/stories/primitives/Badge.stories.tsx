import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '@codejam/ui';
import { Mail, Loader2, ArrowUpRight } from 'lucide-react';

const meta = {
  title: 'Primitives/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'secondary',
        'destructive',
        'outline',
        'ghost',
        'link',
      ],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
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

export const WithIcon: Story = {
  render: (args) => (
    <div className="flex gap-2">
      <Badge {...args} data-icon="inline-start">
        <Mail />
        Badge
      </Badge>
      <Badge {...args} data-icon="inline-end">
        Badge
        <Mail />
      </Badge>
    </div>
  ),
};

export const WithSpinner: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <Badge {...args} variant="destructive" data-icon="inline-start">
        <Loader2 className="animate-spin" />
        Deleting
      </Badge>
      <Badge {...args} variant="secondary" data-icon="inline-end">
        Generating
        <Loader2 className="animate-spin" />
      </Badge>
    </div>
  ),
};

export const Link: Story = {
  render: () => (
    <Badge
      render={
        <a href="#link">
          Open Link <ArrowUpRight data-icon="inline-end" />
        </a>
      }
    />
  ),
};

export const CustomColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300">
        Blue
      </Badge>
      <Badge className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300">
        Green
      </Badge>
      <Badge className="bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300">
        Sky
      </Badge>
      <Badge className="bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300">
        Purple
      </Badge>
      <Badge className="bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300">
        Red
      </Badge>
    </div>
  ),
};
