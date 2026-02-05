import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
  Button,
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
  createAvatarGenerator,
  LucideAvatarProvider,
} from '@codejam/ui';
import { Plus, Search, User, Users } from 'lucide-react';

const meta = {
  title: 'Base/Empty',
  component: Empty,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

const provider = new LucideAvatarProvider();
const { Avatar } = createAvatarGenerator(provider);

export const Default: Story = {
  render: () => (
    <Empty className="max-w-[400px]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Search />
        </EmptyMedia>
        <EmptyTitle>No data found</EmptyTitle>
        <EmptyDescription>
          Try adjusting your search or filters to find what you're looking for.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline">Clear Search</Button>
      </EmptyContent>
    </Empty>
  ),
};

export const Outline: Story = {
  render: () => (
    <Empty className="max-w-[400px] border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Plus />
        </EmptyMedia>
        <EmptyTitle>No projects</EmptyTitle>
        <EmptyDescription>
          You haven't created any projects yet. Start by creating your first
          one.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Create Project</Button>
      </EmptyContent>
    </Empty>
  ),
};

export const Background: Story = {
  render: () => (
    <Empty className="max-w-[400px] bg-muted/50">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Users />
        </EmptyMedia>
        <EmptyTitle>No members</EmptyTitle>
        <EmptyDescription>
          Invite members to your team to start collaborating.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="secondary">Invite Members</Button>
      </EmptyContent>
    </Empty>
  ),
};

export const AvatarExample: Story = {
  name: 'Avatar',
  render: () => (
    <Empty className="max-w-[400px]">
      <EmptyHeader>
        <EmptyMedia>
          <Avatar id="user-1" size={48} />
        </EmptyMedia>
        <EmptyTitle>No activity</EmptyTitle>
        <EmptyDescription>
          This user hasn't posted anything yet. Check back later!
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
};

export const AvatarGroup: Story = {
  render: () => (
    <Empty className="max-w-[400px]">
      <EmptyHeader>
        <EmptyMedia className="flex -space-x-3">
          <Avatar
            id="user-1"
            size={48}
            className="border-2 border-background"
          />
          <Avatar
            id="user-2"
            size={48}
            className="border-2 border-background"
          />
          <Avatar
            id="user-3"
            size={48}
            className="border-2 border-background"
          />
        </EmptyMedia>
        <EmptyTitle>No collaborators</EmptyTitle>
        <EmptyDescription>
          Add collaborators to this project to work together.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Add Collaborators</Button>
      </EmptyContent>
    </Empty>
  ),
};

export const InputGroupUsage: Story = {
  name: 'InputGroup',
  render: () => (
    <Empty className="max-w-[400px]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <User />
        </EmptyMedia>
        <EmptyTitle>Invite friends</EmptyTitle>
        <EmptyDescription>
          Share the link below with your friends to invite them.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <InputGroup className="max-w-[280px]">
          <InputGroupInput
            defaultValue="https://example.com/invite/123"
            readOnly
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton variant="ghost">Copy</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </EmptyContent>
    </Empty>
  ),
};
