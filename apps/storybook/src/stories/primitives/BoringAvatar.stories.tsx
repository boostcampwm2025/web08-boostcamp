import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  createAvatarGenerator,
  BoringAvatarProvider,
  DEFAULT_BORING_AVATAR_COLORS,
  type BoringAvatarVariant,
} from '@codejam/ui';

const { Avatar: BoringAvatar } = createAvatarGenerator(
  new BoringAvatarProvider(),
);

const meta = {
  title: 'Primitives/BoringAvatar',
  component: BoringAvatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    id: {
      control: 'text',
      description: '고유 ID (아바타 생성에 사용)',
    },
    size: {
      control: { type: 'range', min: 24, max: 120, step: 4 },
      description: '아바타 크기 (픽셀)',
    },
  },
} satisfies Meta<typeof BoringAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: '1234',
    size: 40,
  },
};

export const WithBadge: Story = {
  args: {
    id: '1234',
    size: 40,
    badge: '👑',
  },
};

export const DifferentIds: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {['1001', '1002', '1003', '1004', '1005'].map((id) => (
        <BoringAvatar key={id} id={id} size={40} />
      ))}
    </div>
  ),
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {[24, 32, 40, 56, 72].map((size) => (
        <BoringAvatar key={size} id="1234" size={size} />
      ))}
    </div>
  ),
};

export const VariantBeam: Story = {
  render: () => {
    const { Avatar } = createAvatarGenerator(
      new BoringAvatarProvider({ variant: 'beam' }),
    );
    return (
      <div className="flex items-center gap-4">
        {['1001', '1002', '1003', '1004', '1005'].map((id) => (
          <Avatar key={id} id={id} size={40} />
        ))}
      </div>
    );
  },
};

export const VariantMarble: Story = {
  render: () => {
    const { Avatar } = createAvatarGenerator(
      new BoringAvatarProvider({ variant: 'marble' }),
    );
    return (
      <div className="flex items-center gap-4">
        {['1001', '1002', '1003', '1004', '1005'].map((id) => (
          <Avatar key={id} id={id} size={40} />
        ))}
      </div>
    );
  },
};

export const VariantPixel: Story = {
  render: () => {
    const { Avatar } = createAvatarGenerator(
      new BoringAvatarProvider({ variant: 'pixel' }),
    );
    return (
      <div className="flex items-center gap-4">
        {['1001', '1002', '1003', '1004', '1005'].map((id) => (
          <Avatar key={id} id={id} size={40} />
        ))}
      </div>
    );
  },
};

export const VariantSunset: Story = {
  render: () => {
    const { Avatar } = createAvatarGenerator(
      new BoringAvatarProvider({ variant: 'sunset' }),
    );
    return (
      <div className="flex items-center gap-4">
        {['1001', '1002', '1003', '1004', '1005'].map((id) => (
          <Avatar key={id} id={id} size={40} />
        ))}
      </div>
    );
  },
};

export const VariantRing: Story = {
  render: () => {
    const { Avatar } = createAvatarGenerator(
      new BoringAvatarProvider({ variant: 'ring' }),
    );
    return (
      <div className="flex items-center gap-4">
        {['1001', '1002', '1003', '1004', '1005'].map((id) => (
          <Avatar key={id} id={id} size={40} />
        ))}
      </div>
    );
  },
};

export const VariantBauhaus: Story = {
  render: () => {
    const { Avatar } = createAvatarGenerator(
      new BoringAvatarProvider({ variant: 'bauhaus' }),
    );
    return (
      <div className="flex items-center gap-4">
        {['1001', '1002', '1003', '1004', '1005'].map((id) => (
          <Avatar key={id} id={id} size={40} />
        ))}
      </div>
    );
  },
};

export const CustomColors: Story = {
  render: () => {
    const customColors = ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'];
    const { Avatar } = createAvatarGenerator(
      new BoringAvatarProvider({ colors: customColors }),
    );
    return (
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-sm text-gray-500">Custom Colors</p>
          <div className="flex items-center gap-4">
            {['1001', '1002', '1003', '1004', '1005'].map((id) => (
              <Avatar key={id} id={id} size={40} />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm text-gray-500">Default Colors</p>
          <div className="flex items-center gap-4">
            {DEFAULT_BORING_AVATAR_COLORS.map((color, i) => (
              <div
                key={i}
                className="h-10 w-10 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: () => {
    const variants: BoringAvatarVariant[] = [
      'beam',
      'marble',
      'pixel',
      'sunset',
      'ring',
      'bauhaus',
    ];
    return (
      <div className="flex flex-col gap-4">
        {variants.map((variant) => {
          const { Avatar } = createAvatarGenerator(
            new BoringAvatarProvider({ variant }),
          );
          return (
            <div key={variant} className="flex items-center gap-4">
              <span className="w-20 text-sm text-gray-500">{variant}</span>
              {['1001', '1002', '1003', '1004', '1005'].map((id) => (
                <Avatar key={id} id={id} size={40} />
              ))}
            </div>
          );
        })}
      </div>
    );
  },
};
