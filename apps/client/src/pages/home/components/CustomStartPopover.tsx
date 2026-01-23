import type { CustomRoomData } from '@/shared/api/room';
import { Button, Input } from '@/shared/ui';
import { Slider } from '@/shared/ui/slider';
import { ArrowRight, Check, ChevronLeft, Lock, Users } from 'lucide-react';
import { useState } from 'react';

interface Props {
  onCreate: (data: CustomRoomData) => void;
  isLoading: boolean;
}

const validatePassword = (pwd: string) => {
  if (!pwd) return true;
  return /^[a-zA-Z0-9]{1,16}$/.test(pwd);
};

export function CustomStartPopover({ onCreate, isLoading }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [data, setData] = useState({
    maxPts: 6,
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
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
          {step === 1 ? (
            <>
              <div className="p-1.5 bg-brand-blue-50 rounded-md text-brand-blue">
                <Users size={14} />
              </div>
              참여 인원 설정
            </>
          ) : (
            <>
              <div className="p-1.5 bg-brand-green-50 rounded-md text-brand-green">
                <Lock size={14} />
              </div>
              보안 설정
            </>
          )}
        </h4>
        <span className="text-[10px] font-mono font-bold tracking-wider text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
          {step}/2
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gray-600 font-medium">
                  최대 인원
                </span>
                <span className="text-2xl font-bold text-brand-blue font-mono">
                  {data.maxPts}
                  <span className="text-sm text-gray-400 font-sans ml-1 font-normal">
                    명
                  </span>
                </span>
              </div>

              <Slider
                defaultValue={[6]}
                value={[data.maxPts]}
                min={2}
                max={150}
                step={1}
                onValueChange={handleSliderChange}
                className="cursor-pointer py-2"
              />

              <p className="text-xs text-gray-400 text-center bg-gray-50 py-2 rounded">
                최소 2명부터 최대 150명까지 설정 가능합니다.
              </p>
            </div>
            <div>
              <Button
                className="w-full bg-brand-blue hover:bg-blue-600 text-white h-11 rounded-lg transition-all shadow-md shadow-brand-blue/20"
                onClick={() => setStep(2)}
              >
                다음 단계
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-0.5">
                  방 비밀번호 (선택)
                </label>
                <Input
                  type="password"
                  placeholder="영문+숫자 1~16자리"
                  value={data.roomPassword}
                  onChange={(e) => handleChange('roomPassword', e.target.value)}
                  className={`h-11 transition-all ${
                    errors.room
                      ? 'border-red-500 focus:border-red-500 ring-red-100 focus:ring-red-100'
                      : 'border-gray-200 focus:border-brand-blue focus:ring-brand-blue/10'
                  }`}
                />
                {errors.room && (
                  <span className="text-[10px] text-red-500 ml-1">
                    영문+숫자 조합 1~16자리로 입력해주세요.
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-0.5">
                  호스트 비밀번호 (선택)
                </label>
                <Input
                  type="password"
                  placeholder="영문+숫자 1~16자리"
                  value={data.hostPassword}
                  onChange={(e) => handleChange('hostPassword', e.target.value)}
                  className={`h-11 transition-all ${
                    errors.host
                      ? 'border-red-500 focus:border-red-500 ring-red-100 focus:ring-red-100'
                      : 'border-gray-200 focus:border-brand-blue focus:ring-brand-blue/10'
                  }`}
                />
                {errors.host && (
                  <span className="text-[10px] text-red-500 ml-1">
                    영문+숫자 조합 1~16자리로 입력해주세요.
                  </span>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="px-3 border-gray-200 hover:bg-gray-50 text-gray-600"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  className="flex-1 bg-brand-green hover:bg-green-600 text-white h-11 shadow-lg shadow-brand-green/20 rounded-lg transition-all hover:-translate-y-0.5"
                  onClick={handleCreate}
                  disabled={isLoading}
                >
                  {isLoading ? '생성 중...' : '방 생성하기'}
                  {!isLoading && <Check className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
