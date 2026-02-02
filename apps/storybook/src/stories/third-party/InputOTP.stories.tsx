import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from '@codejam/ui';
import { useState } from 'react';

const meta = {
  title: 'ThirdParty/InputOTP',
  component: InputOTP,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    maxLength: { control: 'number' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof InputOTP>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    maxLength: 6,
  },
  render: (args) => (
    <InputOTP {...args}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const WithSeparator: Story = {
  args: {
    maxLength: 6,
  },
  render: (args) => (
    <InputOTP {...args}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const Controlled: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState('');

    return (
      <div className="space-y-2">
        <InputOTP
          maxLength={6}
          value={value}
          onChange={(value) => setValue(value)}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <div className="text-center text-sm">
          {value === '' ? (
            <>코드를 입력해주세요.</>
          ) : (
            <>입력된 코드: {value}</>
          )}
        </div>
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    maxLength: 6,
    disabled: true,
  },
  render: (args) => (
    <InputOTP {...args}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const Invalid: Story = {
  args: {
    maxLength: 6,
    // @ts-expect-error - aria-invalid is not in the types but is passed to DOM
    'aria-invalid': true,
  },
  render: (args) => (
    <InputOTP {...args}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const FourDigits: Story = {
  args: {
    maxLength: 4,
    pattern: REGEXP_ONLY_DIGITS,
  },
  render: (args) => (
    <div className="space-y-2">
      <InputOTP {...args}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
      <div className="text-center text-sm text-muted-foreground">
        비밀번호를 입력해주세요.
      </div>
    </div>
  ),
};

export const Alphanumeric: Story = {
  args: {
    maxLength: 6,
    pattern: REGEXP_ONLY_DIGITS_AND_CHARS,
  },
  render: (args) => (
    <div className="space-y-2">
      <InputOTP {...args}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <div className="text-center text-sm text-muted-foreground">
        영문과 숫자를 입력할 수 있습니다.
      </div>
    </div>
  ),
};
