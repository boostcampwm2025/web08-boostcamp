import {
  LIMITS,
  passwordSchema,
  type CreateCustomRoomRequest,
} from '@codejam/common';
import {
  Button,
  ButtonGroup,
  Input,
  Field,
  FieldTitle,
  FieldDescription,
  FieldError,
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from '@codejam/ui';
import { ArrowLeft, Eye, EyeOff, Loader2, Minus, Plus } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { ErrorMessage } from './ErrorMessage';

interface FormFieldProps {
  title: string;
  description: string;
  children: ReactNode;
}

function FormField({ title, description, children }: FormFieldProps) {
  return (
    <Field
      orientation="horizontal"
      className="flex items-start justify-between"
    >
      <div>
        <FieldTitle className="text-base">{title}</FieldTitle>
        <FieldDescription className="text-xs">{description}</FieldDescription>
      </div>
      {children}
    </Field>
  );
}

interface StepperFieldProps {
  title: string;
  description: string;
  value: number;
  min: number;
  max: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDecrease: () => void;
  onIncrease: () => void;
  className?: string;
}

function StepperField({
  title,
  description,
  value,
  min,
  max,
  onChange,
  onDecrease,
  onIncrease,
  className,
}: StepperFieldProps) {
  return (
    <div className={className}>
      <FormField title={title} description={description}>
        <ButtonGroup>
          <Input
            type="number"
            value={value}
            onChange={onChange}
            className="h-9 w-14 [appearance:textfield] text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={onDecrease}
            disabled={value <= min}
            type="button"
          >
            <Minus className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onIncrease}
            disabled={value >= max}
            type="button"
          >
            <Plus className="size-4" />
          </Button>
        </ButtonGroup>
      </FormField>
    </div>
  );
}

interface PasswordFieldProps {
  title: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  onToggleVisibility: () => void;
  isInvalid?: boolean;
  errorMessage?: string;
}

function PasswordField({
  title,
  value,
  onChange,
  showPassword,
  onToggleVisibility,
  isInvalid,
  errorMessage,
}: PasswordFieldProps) {
  return (
    <FormField
      title={`${title}`}
      description={`영문+숫자 ${LIMITS.PASSWORD_MIN}~${LIMITS.PASSWORD_MAX}자리 (선택)`}
    >
      <div className="flex flex-col items-end gap-1">
        <InputGroup className="h-9 w-46">
          <InputGroupInput
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            minLength={LIMITS.PASSWORD_MIN}
            maxLength={LIMITS.PASSWORD_MAX}
            aria-invalid={isInvalid}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              onClick={onToggleVisibility}
              type="button"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <FieldError
          className={`w-full text-xs transition-all duration-300 ${
            isInvalid && errorMessage
              ? 'translate-y-0 opacity-100'
              : '-translate-y-1 opacity-0'
          }`}
        >
          {errorMessage || '\u00A0'}
        </FieldError>
      </div>
    </FormField>
  );
}

interface Props {
  onCancel: () => void;
  onCreate: (data: CreateCustomRoomRequest) => void;
  isLoading: boolean;
  error?: string;
}

export function CustomRoomForm({
  onCancel,
  onCreate,
  isLoading,
  error,
}: Props) {
  const [customRoomConfig, setCustomRoomConfig] =
    useState<CreateCustomRoomRequest>({
      maxPts: LIMITS.MAX_CAN_EDIT,
    });

  const [showRoomPassword, setShowRoomPassword] = useState(true);
  const [showHostPassword, setShowHostPassword] = useState(true);

  const validatePassword = (
    value: string | undefined,
  ): { isValid: boolean; error?: string } => {
    if (!value || value.trim() === '') return { isValid: true };
    const result = passwordSchema.safeParse(value);
    if (result.success) return { isValid: true };
    return { isValid: false, error: result.error.issues[0]?.message };
  };

  const roomPasswordValidation = validatePassword(
    customRoomConfig.roomPassword,
  );
  const hostPasswordValidation = validatePassword(
    customRoomConfig.hostPassword,
  );

  const isMaxPtsValid =
    customRoomConfig.maxPts >= LIMITS.MIN_PTS &&
    customRoomConfig.maxPts <= LIMITS.MAX_PTS;

  const isFormValid =
    isMaxPtsValid &&
    roomPasswordValidation.isValid &&
    hostPasswordValidation.isValid;

  const handleCreateCustomRoom = () => {
    if (!isFormValid) return;

    const roomPassword = customRoomConfig.roomPassword?.trim() || undefined;
    const hostPassword = customRoomConfig.hostPassword?.trim() || undefined;

    onCreate({
      maxPts: customRoomConfig.maxPts,
      roomPassword,
      hostPassword,
    });
  };

  const handleChange = <K extends keyof CreateCustomRoomRequest>(
    field: K,
    value: CreateCustomRoomRequest[K],
  ) => {
    setCustomRoomConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleMaxPtsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      handleChange(
        'maxPts',
        Math.min(Math.max(val, LIMITS.MIN_PTS), LIMITS.MAX_PTS),
      );
    }
  };

  const decreaseMaxPts = () => {
    handleChange(
      'maxPts',
      Math.max(customRoomConfig.maxPts - 1, LIMITS.MIN_PTS),
    );
  };

  const increaseMaxPts = () => {
    handleChange(
      'maxPts',
      Math.min(customRoomConfig.maxPts + 1, LIMITS.MAX_PTS),
    );
  };

  const handleRoomPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('roomPassword', e.target.value);
  };

  const handleHostPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('hostPassword', e.target.value);
  };

  const toggleRoomPasswordVisibility = () => {
    setShowRoomPassword(!showRoomPassword);
  };

  const toggleHostPasswordVisibility = () => {
    setShowHostPassword(!showHostPassword);
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-4 border-b border-gray-100 bg-gray-50/50 p-4">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-gray-500 hover:bg-gray-200"
          onClick={onCancel}
        >
          <ArrowLeft size={18} />
        </Button>
        <h4 className="text-lg font-semibold text-gray-900">방 설정</h4>
      </header>

      <form
        className="flex h-full flex-col justify-between px-12 py-4"
        onSubmit={handleCreateCustomRoom}
      >
        <div className="flex flex-col gap-2">
          <StepperField
            title="참여 인원"
            description={`최소 ${LIMITS.MIN_PTS}명 ~ 최대 ${LIMITS.MAX_PTS}명`}
            value={customRoomConfig.maxPts}
            min={LIMITS.MIN_PTS}
            max={LIMITS.MAX_PTS}
            onChange={handleMaxPtsChange}
            onDecrease={decreaseMaxPts}
            onIncrease={increaseMaxPts}
            className="mb-4"
          />

          <PasswordField
            title="방 비밀번호"
            value={customRoomConfig.roomPassword ?? ''}
            onChange={handleRoomPasswordChange}
            showPassword={showRoomPassword}
            onToggleVisibility={toggleRoomPasswordVisibility}
            isInvalid={!roomPasswordValidation.isValid}
            errorMessage={roomPasswordValidation.error}
          />

          <PasswordField
            title="호스트 비밀번호"
            value={customRoomConfig.hostPassword ?? ''}
            onChange={handleHostPasswordChange}
            showPassword={showHostPassword}
            onToggleVisibility={toggleHostPasswordVisibility}
            isInvalid={!hostPasswordValidation.isValid}
            errorMessage={hostPasswordValidation.error}
          />
        </div>
        <div className="space-y-2">
          <Button
            className="group w-full rounded-xl bg-blue-600 p-7 text-xl text-white shadow-md transition-all hover:bg-blue-700"
            onClick={handleCreateCustomRoom}
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-3">
                <Loader2 className="size-7 animate-spin" />
                생성 중
              </span>
            ) : (
              '방 생성하기'
            )}
          </Button>
          <ErrorMessage message={error} />
        </div>
      </form>
    </div>
  );
}
