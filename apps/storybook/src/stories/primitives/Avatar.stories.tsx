import type { Meta, StoryObj } from '@storybook/react-vite';
import { createAvatarGenerator, LucideAvatarProvider } from '@codejam/ui';

const provider = new LucideAvatarProvider();
const { Avatar } = createAvatarGenerator(provider);

// 참가자 색상 (PT_COLORS)
const PT_COLORS = [
  '#ef4444', // red
  '#22c55e', // green
  '#3b82f6', // blue
  '#eab308', // yellow
  '#a855f7', // purple
  '#ec4899', // pink
] as const;

const meta = {
  title: 'Primitives/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    id: {
      control: 'text',
      description: '아바타 ID (아이콘 결정)',
    },
    color: {
      control: 'color',
      description: '배경색',
    },
    size: {
      control: { type: 'range', min: 16, max: 120, step: 4 },
      description: '아바타 크기 (픽셀)',
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'user-123',
    color: PT_COLORS[2], // blue
    size: 40,
  },
};

export const WithBadge: Story = {
  args: {
    id: 'user-123',
    color: PT_COLORS[2],
    size: 40,
    badge: '👑',
  },
};

export const Small: Story = {
  args: {
    id: 'user-456',
    color: PT_COLORS[1], // green
    size: 32,
  },
};

export const Large: Story = {
  args: {
    id: 'user-789',
    color: PT_COLORS[0], // red
    size: 64,
  },
};

export const AllParticipantColors: Story = {
  args: { id: 'user', color: PT_COLORS[0], size: 40 },
  render: () => (
    <div className="flex items-center gap-4">
      {PT_COLORS.map((color, i) => (
        <div key={color} className="flex flex-col items-center gap-1">
          <Avatar id={`user-${i}`} color={color} size={40} />
          <span className="text-xs text-gray-500">{color}</span>
        </div>
      ))}
    </div>
  ),
};

export const DifferentSizes: Story = {
  args: { id: 'user-123', color: PT_COLORS[2], size: 40 },
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar id="user-123" color={PT_COLORS[2]} size={24} />
      <Avatar id="user-123" color={PT_COLORS[2]} size={32} />
      <Avatar id="user-123" color={PT_COLORS[2]} size={40} />
      <Avatar id="user-123" color={PT_COLORS[2]} size={56} />
      <Avatar id="user-123" color={PT_COLORS[2]} size={72} />
    </div>
  ),
};

export const WithBadges: Story = {
  args: { id: 'host-user', color: PT_COLORS[0], size: 48 },
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar id="host-user" color={PT_COLORS[0]} size={48} badge="👑" />
      <Avatar id="star-user" color={PT_COLORS[1]} size={48} badge="⭐" />
      <Avatar id="fire-user" color={PT_COLORS[2]} size={48} badge="🔥" />
      <Avatar id="sparkle-user" color={PT_COLORS[3]} size={48} badge="✨" />
    </div>
  ),
};

export const AllIcons: Story = {
  args: { id: 'icon-0', color: PT_COLORS[2], size: 48 },
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <Avatar
            id={`icon-${i}`}
            color={PT_COLORS[i % PT_COLORS.length]}
            size={48}
          />
          <span className="text-xs text-gray-500">icon-{i}</span>
        </div>
      ))}
    </div>
  ),
};
