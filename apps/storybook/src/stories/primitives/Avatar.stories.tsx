import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '@codejam/ui';
import {
  UserIcon,
  SmileIcon,
  HeartIcon,
  StarIcon,
  ZapIcon,
} from 'lucide-react';

const meta = {
  title: 'Primitives/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'range', min: 16, max: 120, step: 4 },
      description: '아바타 크기 (픽셀)',
    },
    color: {
      control: 'color',
      description: '배경색',
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: UserIcon,
    color: '#3b82f6',
    size: 40,
  },
};

export const WithBadge: Story = {
  args: {
    icon: UserIcon,
    color: '#3b82f6',
    size: 40,
    badge: '👑',
  },
};

export const Small: Story = {
  args: {
    icon: SmileIcon,
    color: '#10b981',
    size: 32,
  },
};

export const Large: Story = {
  args: {
    icon: HeartIcon,
    color: '#ef4444',
    size: 64,
  },
};

export const DifferentColors: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar icon={UserIcon} color="#3b82f6" size={40} />
      <Avatar icon={SmileIcon} color="#10b981" size={40} />
      <Avatar icon={HeartIcon} color="#ef4444" size={40} />
      <Avatar icon={StarIcon} color="#f59e0b" size={40} />
      <Avatar icon={ZapIcon} color="#8b5cf6" size={40} />
    </div>
  ),
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar icon={UserIcon} color="#3b82f6" size={24} />
      <Avatar icon={UserIcon} color="#3b82f6" size={32} />
      <Avatar icon={UserIcon} color="#3b82f6" size={40} />
      <Avatar icon={UserIcon} color="#3b82f6" size={56} />
      <Avatar icon={UserIcon} color="#3b82f6" size={72} />
    </div>
  ),
};

export const WithBadges: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar icon={UserIcon} color="#3b82f6" size={48} badge="👑" />
      <Avatar icon={SmileIcon} color="#10b981" size={48} badge="⭐" />
      <Avatar icon={HeartIcon} color="#ef4444" size={48} badge="🔥" />
      <Avatar icon={StarIcon} color="#f59e0b" size={48} badge="✨" />
    </div>
  ),
};
