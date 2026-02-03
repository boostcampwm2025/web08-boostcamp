import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSet,
  FieldLegend,
  Input,
  Switch,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Checkbox,
} from '@codejam/ui';

const meta = {
  title: 'Base/Field',
  component: Field,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Field className="w-[300px]" {...args}>
      <FieldLabel>Label</FieldLabel>
      <Input placeholder="Enter text..." />
    </Field>
  ),
};

export const WithDescription: Story = {
  render: (args) => (
    <Field className="w-[300px]" {...args}>
      <FieldLabel>Email</FieldLabel>
      <Input placeholder="email@example.com" />
      <FieldDescription>
        We'll never share your email with anyone else.
      </FieldDescription>
    </Field>
  ),
};

export const WithError: Story = {
  render: (args) => (
    <Field className="w-[300px]" {...args}>
      <FieldLabel>Username</FieldLabel>
      <Input placeholder="username" defaultValue="taken_username" />
      <FieldError errors={[{ message: 'Username is already taken.' }]} />
    </Field>
  ),
};

export const WithSelect: Story = {
  render: (args) => (
    <Field className="w-[300px]" {...args}>
      <FieldLabel>Theme</FieldLabel>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
      <FieldDescription>
        Select the theme for the dashboard.
      </FieldDescription>
    </Field>
  ),
};

export const WithSwitch: Story = {
  args: {
    orientation: 'horizontal',
  },
  render: (args) => (
    <Field className="w-[300px] justify-between" {...args}>
      <FieldLabel>Marketing emails</FieldLabel>
      <Switch />
    </Field>
  ),
};

export const WithCheckbox: Story = {
  args: {
    orientation: 'horizontal',
  },
  render: (args) => (
    <Field className="w-[300px]" {...args}>
      <Checkbox id="terms" />
      <FieldLabel htmlFor="terms" className="font-normal">
        Accept terms and conditions
      </FieldLabel>
    </Field>
  ),
};

export const FieldGroupExample: Story = {
  render: () => (
    <FieldGroup className="w-[300px]">
      <FieldSet>
        <FieldLegend>Personal Information</FieldLegend>
        <Field>
          <FieldLabel>First Name</FieldLabel>
          <Input placeholder="John" />
        </Field>
        <Field>
          <FieldLabel>Last Name</FieldLabel>
          <Input placeholder="Doe" />
        </Field>
      </FieldSet>
      <FieldSet>
        <FieldLegend>Account Settings</FieldLegend>
        <Field orientation="horizontal" className="justify-between">
          <FieldLabel>Notifications</FieldLabel>
          <Switch defaultChecked />
        </Field>
      </FieldSet>
    </FieldGroup>
  ),
};
