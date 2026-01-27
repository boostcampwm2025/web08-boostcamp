import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  createAvatarGenerator,
  BoringAvatarProvider,
  AvvvatarsProvider,
  type AvvvatarsVariant,
} from '@codejam/ui';

const { Avatar: AvvvatarsAvatar } = createAvatarGenerator(
  new AvvvatarsProvider(),
);

const meta = {
  title: 'Primitives/Avvvatars',
  component: AvvvatarsAvatar,
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
      control: { type: 'range', min: 16, max: 120, step: 4 },
      description: '아바타 크기 (픽셀)',
    },
  },
} satisfies Meta<typeof AvvvatarsAvatar>;

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
        <AvvvatarsAvatar key={id} id={id} size={40} />
      ))}
    </div>
  ),
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {[24, 32, 40, 56, 72].map((size) => (
        <AvvvatarsAvatar key={size} id="1234" size={size} />
      ))}
    </div>
  ),
};

export const VariantShape: Story = {
  render: () => {
    const { Avatar } = createAvatarGenerator(
      new AvvvatarsProvider({ variant: 'shape' }),
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

export const VariantCharacter: Story = {
  render: () => {
    const { Avatar } = createAvatarGenerator(
      new AvvvatarsProvider({ variant: 'character' }),
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

export const AllVariants: Story = {
  render: () => {
    const variants: AvvvatarsVariant[] = ['shape', 'character'];
    return (
      <div className="flex flex-col gap-4">
        {variants.map((variant) => {
          const { Avatar } = createAvatarGenerator(
            new AvvvatarsProvider({ variant }),
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

export const CompareWithBoringAvatars: Story = {
  render: () => {
    const { Avatar: Boring } = createAvatarGenerator(
      new BoringAvatarProvider(),
    );
    const { Avatar: Avvvatars } = createAvatarGenerator(
      new AvvvatarsProvider(),
    );
    const ids = ['1001', '1002', '1003', '1004', '1005'];

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="w-28 text-sm text-gray-500">Boring Avatars</span>
          {ids.map((id) => (
            <Boring key={id} id={id} size={40} />
          ))}
        </div>
        <div className="flex items-center gap-4">
          <span className="w-28 text-sm text-gray-500">Avvvatars</span>
          {ids.map((id) => (
            <Avvvatars key={id} id={id} size={40} />
          ))}
        </div>
      </div>
    );
  },
};
