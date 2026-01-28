import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@codejam/ui';
import { Button } from '@codejam/ui';

const meta = {
  title: 'Base/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">팝오버 열기</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="space-y-2">
          <h4 className="font-medium">팝오버 제목</h4>
          <p className="text-sm text-muted-foreground">
            팝오버 내용이 여기에 표시됩니다.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
