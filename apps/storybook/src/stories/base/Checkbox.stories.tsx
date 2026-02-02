import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox, Label } from '@codejam/ui';

const meta = {
  title: 'Base/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" {...args} />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

export const WithText: Story = {
  render: (args) => (
    <div className="items-top flex space-x-2">
      <Checkbox id="terms1" {...args} />
      <div className="grid gap-1.5 leading-none">
        <Label htmlFor="terms1">Accept terms and conditions</Label>
        <p className="text-muted-foreground text-sm">
          You agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms2" disabled {...args} />
      <Label htmlFor="terms2">Accept terms and conditions</Label>
    </div>
  ),
};

export const Form: Story = {
  render: () => (
    <div className="items-top flex space-x-2">
      <Checkbox id="terms3" />
      <div className="grid gap-1.5 leading-none">
        <Label htmlFor="terms3">Accept terms and conditions</Label>
        <p className="text-muted-foreground text-sm">
          You agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  ),
};
