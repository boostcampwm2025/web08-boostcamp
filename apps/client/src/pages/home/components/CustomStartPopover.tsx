import type { CustomRoomData } from '@/shared/api/room';
import { LIMITS } from '@codejam/common';
import { RadixButton as Button, RadixInput as Input } from '@codejam/ui';
import { RadixSlider as Slider } from '@codejam/ui';
import { ArrowRight, Check, ChevronLeft, Lock, Users } from 'lucide-react';
import { useState } from 'react';

interface Props {
  onCreate: (data: CustomRoomData) => void;
  isLoading: boolean;
}

const validatePassword = (pwd: string) => {
  if (!pwd) return true;
  return new RegExp(
    `^[a-zA-Z0-9]{${LIMITS.PASSWORD_MIN},${LIMITS.PASSWORD_MAX}}$`,
  ).test(pwd);
};

export function CustomStartPopover({ onCreate, isLoading }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [data, setData] = useState({
    maxPts: LIMITS.MAX_CAN_EDIT,
    roomPassword: '',
    hostPassword: '',
  });

  const [errors, setErrors] = useState({
    room: false,
    host: false,
  });

  const handleSliderChange = (value: number[]) => {
    setData({ ...data, maxPts: value[0] });
  };

  const handleCreate = () => {
    const isRoomValid = validatePassword(data.roomPassword);
    const isHostValid = validatePassword(data.hostPassword);

    if (!isRoomValid || !isHostValid) {
      setErrors({
        room: !isRoomValid,
        host: !isHostValid,
      });
      return;
    }

    onCreate(data);
  };

  const handleChange = (
    field: 'roomPassword' | 'hostPassword',
    value: string,
  ) => {
    setData({ ...data, [field]: value });
    // 사용자가 수정하기 시작하면 해당 필드의 에러 표시 제거
    if (errors[field === 'roomPassword' ? 'room' : 'host']) {
      setErrors((prev) => ({
        ...prev,
        [field === 'roomPassword' ? 'room' : 'host']: false,
      }));
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-4">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          {step === 1 ? (
            <>
              <div className="bg-brand-blue-50 text-brand-blue rounded-md p-1.5">
                <Users size={14} />
              </div>
              참여 인원 설정
            </>
          ) : (
            <>
              <div className="bg-brand-green-50 text-brand-green rounded-md p-1.5">
                <Lock size={14} />
              </div>
              보안 설정
            </>
          )}
        </h4>
        <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-gray-400">
          {step}/2
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-gray-600">
                  최대 인원
                </span>
                <span className="text-brand-blue font-mono text-2xl font-bold">
                  {data.maxPts}
                  <span className="ml-1 font-sans text-sm font-normal text-gray-400">
                    명
                  </span>
                </span>
              </div>

              <Slider
                defaultValue={[LIMITS.MAX_CAN_EDIT]}
                value={[data.maxPts]}
                min={LIMITS.MIN_PTS}
                max={LIMITS.MAX_PTS}
                step={1}
                onValueChange={handleSliderChange}
                className="cursor-pointer py-2"
              />

              <p className="rounded bg-gray-50 py-2 text-center text-xs text-gray-400">
                최소 {LIMITS.MIN_PTS}명부터 최대 {LIMITS.MAX_PTS}명까지 설정
                가능합니다.
              </p>
            </div>
            <div>
              <Button
                className="bg-brand-blue shadow-brand-blue/20 h-11 w-full rounded-lg text-white shadow-md transition-all hover:bg-blue-600"
                onClick={() => setStep(2)}
              >
                다음 단계
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 space-y-4 duration-300">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="ml-0.5 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  방 비밀번호 (선택)
                </label>
                <Input
                  type="password"
                  placeholder={`영문+숫자 ${LIMITS.PASSWORD_MIN}~${LIMITS.PASSWORD_MAX}자리`}
                  value={data.roomPassword}
                  onChange={(e) => handleChange('roomPassword', e.target.value)}
                  className={`h-11 transition-all ${
                    errors.room
                      ? 'border-red-500 ring-red-100 focus:border-red-500 focus:ring-red-100'
                      : 'focus:border-brand-blue focus:ring-brand-blue/10 border-gray-200'
                  }`}
                />
                {errors.room && (
                  <span className="ml-1 text-[10px] text-red-500">
                    영문+숫자 조합 {LIMITS.PASSWORD_MIN}~{LIMITS.PASSWORD_MAX}
                    자리로 입력해주세요.
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="ml-0.5 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  호스트 비밀번호 (선택)
                </label>
                <Input
                  type="password"
                  placeholder={`영문+숫자 ${LIMITS.PASSWORD_MIN}~${LIMITS.PASSWORD_MAX}자리`}
                  value={data.hostPassword}
                  onChange={(e) => handleChange('hostPassword', e.target.value)}
                  className={`h-11 transition-all ${
                    errors.host
                      ? 'border-red-500 ring-red-100 focus:border-red-500 focus:ring-red-100'
                      : 'focus:border-brand-blue focus:ring-brand-blue/10 border-gray-200'
                  }`}
                />
                {errors.host && (
                  <span className="ml-1 text-[10px] text-red-500">
                    영문+숫자 조합 {LIMITS.PASSWORD_MIN}~{LIMITS.PASSWORD_MAX}
                    자리로 입력해주세요.
                  </span>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="border-gray-200 px-3 text-gray-600 hover:bg-gray-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  className="bg-brand-green shadow-brand-green/20 h-11 flex-1 rounded-lg text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-green-600"
                  onClick={handleCreate}
                  disabled={isLoading}
                >
                  {isLoading ? '생성 중...' : '방 생성하기'}
                  {!isLoading && <Check className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
