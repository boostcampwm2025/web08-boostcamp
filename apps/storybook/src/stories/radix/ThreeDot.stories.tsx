import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadixThreeDot as ThreeDot, RadixButton as Button } from '@codejam/ui';

const meta = {
  title: 'Radix/ThreeDot',
  component: ThreeDot,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ThreeDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ThreeDot />,
};

export const InButton: Story = {
  render: () => (
    <Button variant="ghost" size="icon">
      <ThreeDot />
    </Button>
  ),
};

export const Different색Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="text-xs">
        <ThreeDot />
      </div>
      <div className="text-sm">
        <ThreeDot />
      </div>
      <div className="text-base">
        <ThreeDot />
      </div>
      <div className="text-lg">
        <ThreeDot />
      </div>
      <div className="text-xl">
        <ThreeDot />
      </div>
    </div>
  ),
};

export const DifferentColors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="text-primary">
        <ThreeDot />
      </div>
      <div className="text-secondary">
        <ThreeDot />
      </div>
      <div className="text-destructive">
        <ThreeDot />
      </div>
      <div className="text-muted-foreground">
        <ThreeDot />
      </div>
    </div>
  ),
};
