import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label, Input } from '@codejam/ui';

const meta = {
  title: 'Base/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Label',
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="grid w-[300px] items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
  ),
};
